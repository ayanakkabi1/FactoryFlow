/**
 * @openapi
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *       description: Provide the token returned by POST /api/auth/login as Bearer followed by the token.
 *   schemas:
 *     Login:
 *       type: object
 *       required: [email, password]
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: admin@example.com
 *         password:
 *           type: string
 *           format: password
 *           example: secret123
 *     User:
 *       type: object
 *       required: [name, email, password]
 *       properties:
 *         _id:
 *           type: string
 *           readOnly: true
 *         name:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *         password:
 *           type: string
 *           format: password
 *           minLength: 6
 *           writeOnly: true
 *         role:
 *           type: string
 *           enum: [ADMIN, USER, OPERATOR, OPERATEUR]
 *           default: USER
 *         isActive:
 *           type: boolean
 *           default: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *           readOnly: true
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           readOnly: true
 *     Material:
 *       type: object
 *       required: [reference, name, uniteMesure]
 *       properties:
 *         _id:
 *           type: string
 *           readOnly: true
 *         reference:
 *           type: string
 *         name:
 *           type: string
 *         uniteMesure:
 *           type: string
 *         quantiteDisponible:
 *           type: number
 *           minimum: 0
 *           default: 0
 *         seuilAlerte:
 *           type: number
 *           minimum: 0
 *           default: 0
 *         createdAt:
 *           type: string
 *           format: date-time
 *           readOnly: true
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           readOnly: true
 *     Product:
 *       $ref: '#/components/schemas/Produit'
 *     Produit:
 *       type: object
 *       required: [reference, nom]
 *       properties:
 *         _id:
 *           type: string
 *           readOnly: true
 *         reference:
 *           type: string
 *         nom:
 *           type: string
 *         description:
 *           type: string
 *         prix:
 *           type: number
 *           minimum: 0
 *         quantiteDisponible:
 *           type: number
 *           minimum: 0
 *           default: 0
 *         composition:
 *           type: array
 *           items:
 *             type: string
 *             description: CompositionItem MongoDB ID.
 *         createdAt:
 *           type: string
 *           format: date-time
 *           readOnly: true
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           readOnly: true
 *     CompositionItem:
 *       type: object
 *       required: [matiere, quantiteNecessaire]
 *       properties:
 *         _id:
 *           type: string
 *           readOnly: true
 *         produit:
 *           type: string
 *           description: MongoDB product ID; may be omitted when the product ID is in the URL.
 *         matiere:
 *           type: string
 *           description: MongoDB material ID.
 *         quantiteNecessaire:
 *           type: number
 *           minimum: 0
 *         createdAt:
 *           type: string
 *           format: date-time
 *           readOnly: true
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           readOnly: true
 *     CompositionItemSnapshot:
 *       type: object
 *       required: [matiere, nomMatiere, uniteMesure, quantiteUnitaireNecessaire]
 *       properties:
 *         matiere:
 *           type: string
 *         nomMatiere:
 *           type: string
 *         uniteMesure:
 *           type: string
 *         quantiteUnitaireNecessaire:
 *           type: number
 *           minimum: 0
 *     OrderStatus:
 *       type: object
 *       required: [statut]
 *       properties:
 *         statut:
 *           type: string
 *           enum: [PLANIFIE, EN_COURS, TERMINE, ANNULE]
 *     Order:
 *       $ref: '#/components/schemas/OrdreFabrication'
 *     OrdreFabrication:
 *       type: object
 *       required: [code, produit, quantiteAFabriquer, assigneA, composition]
 *       properties:
 *         _id:
 *           type: string
 *           readOnly: true
 *         code:
 *           type: string
 *         produit:
 *           type: string
 *           description: MongoDB product ID.
 *         quantiteAFabriquer:
 *           type: number
 *           minimum: 0
 *         statut:
 *           type: string
 *           enum: [PLANIFIE, EN_COURS, TERMINE, ANNULE]
 *         dateCreation:
 *           type: string
 *           format: date-time
 *         dateDemarrage:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         dateFin:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         assigneA:
 *           type: string
 *           description: MongoDB user ID.
 *         composition:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/CompositionItemSnapshot'
 *         mouvementsStock:
 *           type: array
 *           items:
 *             type: string
 *             description: MouvementStock MongoDB ID.
 *         createdAt:
 *           type: string
 *           format: date-time
 *           readOnly: true
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           readOnly: true
 *     StockMovement:
 *       type: object
 *       required: [type, matiereId, quantite]
 *       properties:
 *         type:
 *           type: string
 *           enum: [ENTREE, SORTIE]
 *         matiereId:
 *           type: string
 *           description: MongoDB material ID.
 *         quantite:
 *           type: number
 *           minimum: 0
 *         motif:
 *           type: string
 *           maxLength: 255
 *     MouvementStock:
 *       type: object
 *       required: [type, quantite, utilisateur]
 *       properties:
 *         _id:
 *           type: string
 *           readOnly: true
 *         type:
 *           type: string
 *           enum: [ENTREE, SORTIE]
 *         quantite:
 *           type: number
 *           minimum: 0
 *         dateMouvement:
 *           type: string
 *           format: date-time
 *         matiere:
 *           type: string
 *           nullable: true
 *         produit:
 *           type: string
 *           nullable: true
 *         utilisateur:
 *           type: string
 *         ordreFabrication:
 *           type: string
 *           nullable: true
 *         motif:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *           readOnly: true
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           readOnly: true
 *     Installation:
 *       type: object
 *       required: [name, email, password]
 *       properties:
 *         name:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *         password:
 *           type: string
 *           format: password
 *           minLength: 6
 *     InstallationRecord:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           readOnly: true
 *         isInstalled:
 *           type: boolean
 *         installedAt:
 *           type: string
 *           format: date-time
 *         installedBy:
 *           type: string
 *           nullable: true
 *         adminInitialEmail:
 *           type: string
 *           format: email
 *         createdAt:
 *           type: string
 *           format: date-time
 *           readOnly: true
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           readOnly: true
 *     ActionOperateur:
 *       type: object
 *       required: [operateur, ordreFabrication, action]
 *       properties:
 *         _id:
 *           type: string
 *           readOnly: true
 *         operateur:
 *           type: string
 *         ordreFabrication:
 *           type: string
 *         action:
 *           type: string
 *           enum: [DEMARRAGE_ORDRE, FINALISATION_ORDRE]
 *         details:
 *           type: object
 *           additionalProperties: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *           readOnly: true
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           readOnly: true
 *     Notification:
 *       type: object
 *       required: [message, matiere, quantiteDisponible, seuilAlerte]
 *       properties:
 *         _id:
 *           type: string
 *           readOnly: true
 *         type:
 *           type: string
 *           enum: [ALERTE_STOCK]
 *         niveau:
 *           type: string
 *           enum: [CRITIQUE, RUPTURE]
 *         message:
 *           type: string
 *         matiere:
 *           type: string
 *         quantiteDisponible:
 *           type: number
 *         seuilAlerte:
 *           type: number
 *         mouvement:
 *           type: string
 *           nullable: true
 *         lu:
 *           type: boolean
 *         dateNotification:
 *           type: string
 *           format: date-time
 *         createdAt:
 *           type: string
 *           format: date-time
 *           readOnly: true
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           readOnly: true
 */

export {};
