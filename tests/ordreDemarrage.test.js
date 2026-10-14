import bcrypt from 'bcryptjs';
import request from 'supertest';
import app from '../src/app.js';
import {
  createOrdreService,
  demarrerOrdreService,
} from '../src/services/orderService.js';
import OrdreFabrication from '../src/models/OrdreFabrication.js';
import Produit from '../src/models/Produit.js';
import User from '../src/models/User.js';
import Material from '../src/models/Material.js';
import CompositionItem from '../src/models/CompositionItem.js';
import MouvementStock from '../src/models/MouvementStock.js';
import Notification from '../src/models/Notification.js';
import './setup.js';

const PASSWORD = 'securepassword123';

const createUser = async (role, email) =>
  User.create({
    name: role,
    email,
    password: await bcrypt.hash(PASSWORD, 10),
    role,
  });

const loginAs = async (email) => {
  const response = await request(app)
    .post('/api/auth/login')
    .send({ email, password: PASSWORD });
  return response.body.token;
};

const buildFixture = async ({ stockAcier = 100, stockVis = 50, seuilVis = 0 } = {}) => {
  const operateur = await createUser('OPERATEUR', 'operateur@factoryflow.com');

  const acier = await Material.create({
    reference: 'mat-acier',
    name: 'Acier',
    uniteMesure: 'kg',
    quantiteDisponible: stockAcier,
    seuilAlerte: 0,
  });
  const vis = await Material.create({
    reference: 'mat-vis',
    name: 'Vis',
    uniteMesure: 'kg',
    quantiteDisponible: stockVis,
    seuilAlerte: seuilVis,
  });

  const produit = await Produit.create({ reference: 'prod-001', nom: 'Pièce' });
  await CompositionItem.create({
    produit: produit._id,
    matiere: acier._id,
    quantiteNecessaire: 2.5,
  });
  await CompositionItem.create({
    produit: produit._id,
    matiere: vis._id,
    quantiteNecessaire: 0.1,
  });

  return { operateur, acier, vis, produit };
};

const createOrdre = (fixture, code, quantiteAFabriquer) =>
  createOrdreService({
    code,
    produit: fixture.produit._id,
    quantiteAFabriquer,
    assigneA: fixture.operateur._id,
  });

describe("Démarrage d'un ordre de fabrication", () => {
  it('calcule les besoins exacts, déduit le stock et passe l’ordre EN_COURS', async () => {
    const fixture = await buildFixture({ stockAcier: 100, stockVis: 0.5 });
    const ordre = await createOrdre(fixture, 'OF-100', 3);

    const { ordre: demarre, besoins } = await demarrerOrdreService(
      ordre._id,
      fixture.operateur._id
    );

    expect(besoins).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ nomMatiere: 'Acier', quantiteNecessaire: 7.5 }),
        expect.objectContaining({ nomMatiere: 'Vis', quantiteNecessaire: 0.3 }),
      ])
    );

    expect(demarre.statut).toBe('EN_COURS');
    expect(demarre.dateDemarrage).toBeTruthy();
    expect(demarre.mouvementsStock).toHaveLength(2);

    expect((await Material.findById(fixture.acier._id)).quantiteDisponible).toBe(92.5);
    expect((await Material.findById(fixture.vis._id)).quantiteDisponible).toBe(0.2);

    const mouvements = await MouvementStock.find({ ordreFabrication: ordre._id });
    expect(mouvements).toHaveLength(2);
    mouvements.forEach((m) => {
      expect(m.type).toBe('SORTIE');
      expect(m.utilisateur.toString()).toBe(fixture.operateur._id.toString());
    });
  });

  it("n'effectue aucune déduction si une matière est en stock insuffisant", async () => {
    const fixture = await buildFixture({ stockAcier: 100, stockVis: 0.2 });
    const ordre = await createOrdre(fixture, 'OF-101', 3);

    await expect(demarrerOrdreService(ordre._id, fixture.operateur._id)).rejects.toThrow(
      /Stock insuffisant.*Vis/
    );

    expect((await Material.findById(fixture.acier._id)).quantiteDisponible).toBe(100);
    expect((await Material.findById(fixture.vis._id)).quantiteDisponible).toBe(0.2);
    expect(await MouvementStock.countDocuments()).toBe(0);
    expect((await OrdreFabrication.findById(ordre._id)).statut).toBe('PLANIFIE');
  });

  it('refuse de démarrer un ordre déjà démarré', async () => {
    const fixture = await buildFixture();
    const ordre = await createOrdre(fixture, 'OF-102', 2);

    await demarrerOrdreService(ordre._id, fixture.operateur._id);

    await expect(demarrerOrdreService(ordre._id, fixture.operateur._id)).rejects.toThrow(
      'Seuls les ordres au statut PLANIFIE peuvent être démarrés (statut actuel : EN_COURS)'
    );
    expect((await Material.findById(fixture.acier._id)).quantiteDisponible).toBe(95);
    expect(await MouvementStock.countDocuments()).toBe(2);
  });

  it('ne déduit le stock qu’une seule fois lors de démarrages concurrents', async () => {
    const fixture = await buildFixture({ stockAcier: 10, stockVis: 50 });
    const ordreA = await createOrdre(fixture, 'OF-103', 4);
    const ordreB = await createOrdre(fixture, 'OF-104', 4);

    const resultats = await Promise.allSettled([
      demarrerOrdreService(ordreA._id, fixture.operateur._id),
      demarrerOrdreService(ordreB._id, fixture.operateur._id),
    ]);

    expect(resultats.filter((r) => r.status === 'fulfilled')).toHaveLength(1);
    expect(resultats.filter((r) => r.status === 'rejected')).toHaveLength(1);
    expect((await Material.findById(fixture.acier._id)).quantiteDisponible).toBe(0);
    expect(await OrdreFabrication.countDocuments({ statut: 'EN_COURS' })).toBe(1);
    expect(await MouvementStock.countDocuments()).toBe(2);
  });

  it('crée une alerte quand une matière passe sous son seuil', async () => {
    const fixture = await buildFixture({ stockVis: 1, seuilVis: 0.8 });
    const ordre = await createOrdre(fixture, 'OF-105', 3);

    await demarrerOrdreService(ordre._id, fixture.operateur._id);

    const notifications = await Notification.find();
    expect(notifications).toHaveLength(1);
    expect(notifications[0].matiere.toString()).toBe(fixture.vis._id.toString());
    expect(notifications[0].quantiteDisponible).toBe(0.7);
  });

  describe('PATCH /api/ordres/:id/demarrer', () => {
    it('permet à un opérateur de démarrer un ordre', async () => {
      const fixture = await buildFixture();
      const ordre = await createOrdre(fixture, 'OF-200', 2);
      const token = await loginAs('operateur@factoryflow.com');

      const response = await request(app)
        .patch(`/api/ordres/${ordre._id}/demarrer`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.ordre.statut).toBe('EN_COURS');
      expect(response.body.data.besoins).toHaveLength(2);
      expect((await Material.findById(fixture.acier._id)).quantiteDisponible).toBe(95);
    });

    it('retourne 400 avec le détail des manques en cas de stock insuffisant', async () => {
      const fixture = await buildFixture({ stockAcier: 1 });
      const ordre = await createOrdre(fixture, 'OF-201', 2);
      const token = await loginAs('operateur@factoryflow.com');

      const response = await request(app)
        .patch(`/api/ordres/${ordre._id}/demarrer`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(400);
      expect(response.body.details).toEqual([
        expect.objectContaining({
          nomMatiere: 'Acier',
          quantiteNecessaire: 5,
          quantiteDisponible: 1,
          manque: 4,
        }),
      ]);
    });

    it('refuse un utilisateur sans rôle autorisé', async () => {
      const fixture = await buildFixture();
      const ordre = await createOrdre(fixture, 'OF-202', 2);
      await createUser('USER', 'user@factoryflow.com');
      const token = await loginAs('user@factoryflow.com');

      const response = await request(app)
        .patch(`/api/ordres/${ordre._id}/demarrer`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(403);
    });

    it('passer le statut à EN_COURS via /statut déduit aussi le stock', async () => {
      const fixture = await buildFixture();
      const ordre = await createOrdre(fixture, 'OF-203', 2);
      const token = await loginAs('operateur@factoryflow.com');

      const response = await request(app)
        .patch(`/api/ordres/${ordre._id}/statut`)
        .set('Authorization', `Bearer ${token}`)
        .send({ statut: 'EN_COURS' });

      expect(response.status).toBe(200);
      expect(response.body.data.statut).toBe('EN_COURS');
      expect((await Material.findById(fixture.acier._id)).quantiteDisponible).toBe(95);
    });
  });
});
