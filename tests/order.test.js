import {
  createOrdreService,
  updateStatutService,
  deleteOrdreService,
  startOrdreService,
} from '../src/services/orderService.js';
import OrdreFabrication from '../src/models/OrdreFabrication.js';
import Produit from '../src/models/Produit.js';
import User from '../src/models/User.js';
import Material from '../src/models/Material.js';
import CompositionItem from '../src/models/CompositionItem.js';
import MouvementStock from '../src/models/MouvementStock.js';
import './setup.js';

describe('Order service', () => {
  const buildOrderFixture = async () => {
    const user = await User.create({
      name: 'Ada Lovelace',
      email: 'ada@factoryflow.com',
      password: 'securepassword123',
      role: 'ADMIN',
    });

    const material = await Material.create({
      reference: 'MAT-001',
      name: 'Acier',
      uniteMesure: 'kg',
      quantiteDisponible: 100,
      seuilAlerte: 10,
    });

    const product = await Produit.create({
      reference: 'PROD-001',
      nom: 'Pièce de machine',
      description: 'Pièce industrielle',
      prix: 125,
    });

    await CompositionItem.create({
      produit: product._id,
      matiere: material._id,
      quantiteNecessaire: 2,
    });

    return { user, material, product };
  };

  it('creates an order and stores a material composition snapshot', async () => {
    const { user, material, product } = await buildOrderFixture();

    const ordre = await createOrdreService({
      code: 'OF-001',
      produit: product._id,
      quantiteAFabriquer: 5,
      assigneA: user._id,
    });

    expect(ordre).toMatchObject({
      code: 'OF-001',
      quantiteAFabriquer: 5,
      statut: 'PLANIFIE',
    });
    expect(ordre.produit._id.toString()).toBe(product._id.toString());
    expect(ordre.assigneA._id.toString()).toBe(user._id.toString());
    expect(ordre.composition).toHaveLength(1);
    expect(ordre.composition[0]).toMatchObject({
      nomMatiere: material.name,
      uniteMesure: material.uniteMesure,
      quantiteUnitaireNecessaire: 2,
    });
    expect(await OrdreFabrication.countDocuments()).toBe(1);
  });

  it('rejects invalid quantities and duplicate codes', async () => {
    const { user, product } = await buildOrderFixture();

    await expect(
      createOrdreService({
        code: 'OF-002',
        produit: product._id,
        quantiteAFabriquer: 0,
        assigneA: user._id,
      })
    ).rejects.toThrow('La quantité à fabriquer doit être un nombre positif');

    await createOrdreService({
      code: 'OF-002',
      produit: product._id,
      quantiteAFabriquer: 3,
      assigneA: user._id,
    });

    await expect(
      createOrdreService({
        code: 'OF-002',
        produit: product._id,
        quantiteAFabriquer: 4,
        assigneA: user._id,
      })
    ).rejects.toThrow('Un ordre de fabrication avec le code "OF-002" existe déjà');
  });

  it('allows valid status transitions and rejects invalid ones', async () => {
    const { user, product } = await buildOrderFixture();
    const ordre = await createOrdreService({
      code: 'OF-003',
      produit: product._id,
      quantiteAFabriquer: 4,
      assigneA: user._id,
    });

    const started = await updateStatutService(ordre._id, 'EN_COURS');
    expect(started.statut).toBe('EN_COURS');
    expect(started.dateDemarrage).toBeTruthy();

    const finished = await updateStatutService(started._id, 'TERMINE');
    expect(finished.statut).toBe('TERMINE');
    expect(finished.dateFin).toBeTruthy();

    await expect(updateStatutService(finished._id, 'EN_COURS')).rejects.toThrow(
      'Transition de statut invalide : TERMINE → EN_COURS'
    );
  });

  it('prevents deleting an order that is already in progress', async () => {
    const { user, product } = await buildOrderFixture();
    const ordre = await createOrdreService({
      code: 'OF-004',
      produit: product._id,
      quantiteAFabriquer: 2,
      assigneA: user._id,
    });

    await updateStatutService(ordre._id, 'EN_COURS');

    await expect(deleteOrdreService(ordre._id)).rejects.toThrow(
      'Impossible de supprimer un ordre de fabrication en cours'
    );
  });

  it('calculates needs, deducts stock and starts the order atomically', async () => {
    const { user, material, product } = await buildOrderFixture();
    const ordre = await createOrdreService({
      code: 'OF-005',
      produit: product._id,
      quantiteAFabriquer: 5,
      assigneA: user._id,
    });

    const started = await startOrdreService(ordre._id, user._id);

    expect(started.statut).toBe('EN_COURS');
    expect(await Material.findById(material._id).then((item) => item.quantiteDisponible)).toBe(90);
    expect(await MouvementStock.findOne({ ordreFabrication: ordre._id })).toMatchObject({
      type: 'SORTIE',
      quantite: 10,
      matiere: material._id,
      utilisateur: user._id,
    });
  });

  it('rolls back stock and movements when needs cannot be fulfilled', async () => {
    const { user, material, product } = await buildOrderFixture();
    await Material.findByIdAndUpdate(material._id, { quantiteDisponible: 5 });
    const ordre = await createOrdreService({
      code: 'OF-006',
      produit: product._id,
      quantiteAFabriquer: 5,
      assigneA: user._id,
    });

    await expect(startOrdreService(ordre._id, user._id)).rejects.toThrow(
      'Stock insuffisant'
    );
    expect(await Material.findById(material._id).then((item) => item.quantiteDisponible)).toBe(5);
    expect(await MouvementStock.countDocuments()).toBe(0);
    expect(await OrdreFabrication.findById(ordre._id).then((item) => item.statut)).toBe('PLANIFIE');
  });
});
