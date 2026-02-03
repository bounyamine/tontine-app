const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Initialisation des fichiers de données
const initDataFiles = async () => {
    try {
        await fs.mkdir(DATA_DIR, { recursive: true });
        
        const files = {
            'members.json': [],
            'cycles.json': [],
            'payments.json': {},
            'config.json': {
                currentCycle: 1,
                beneficiaryOrder: [],
                startDate: '2026-02-01',
                memberCount: 10,
                cycleAmount: 2000,
                cycleDuration: 10
            }
        };

        for (const [filename, defaultData] of Object.entries(files)) {
            const filePath = path.join(DATA_DIR, filename);
            try {
                await fs.access(filePath);
            } catch {
                await fs.writeFile(filePath, JSON.stringify(defaultData, null, 2));
                console.log(`✅ Fichier ${filename} créé`);
            }
        }
    } catch (error) {
        console.error('❌ Erreur lors de l\'initialisation:', error);
    }
};

// Fonctions utilitaires pour lire/écrire les fichiers JSON
const readJSON = async (filename) => {
    const filePath = path.join(DATA_DIR, filename);
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
};

const writeJSON = async (filename, data) => {
    const filePath = path.join(DATA_DIR, filename);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
};

// ==================== ROUTES API ====================

// GET - Récupérer tous les membres
app.get('/api/members', async (req, res) => {
    try {
        const members = await readJSON('members.json');
        res.json(members);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST - Ajouter un membre
app.post('/api/members', async (req, res) => {
    try {
        const members = await readJSON('members.json');
        const newMember = {
            id: members.length + 1,
            name: req.body.name,
            phone: req.body.phone || '',
            status: 'Actif',
            createdAt: new Date().toISOString()
        };
        members.push(newMember);
        await writeJSON('members.json', members);
        res.status(201).json(newMember);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT - Mettre à jour un membre
app.put('/api/members/:id', async (req, res) => {
    try {
        const members = await readJSON('members.json');
        const index = members.findIndex(m => m.id === parseInt(req.params.id));
        if (index === -1) {
            return res.status(404).json({ error: 'Membre non trouvé' });
        }
        members[index] = { ...members[index], ...req.body };
        await writeJSON('members.json', members);
        res.json(members[index]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE - Supprimer un membre
app.delete('/api/members/:id', async (req, res) => {
    try {
        let members = await readJSON('members.json');
        members = members.filter(m => m.id !== parseInt(req.params.id));
        await writeJSON('members.json', members);
        res.json({ message: 'Membre supprimé' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET - Récupérer tous les cycles
app.get('/api/cycles', async (req, res) => {
    try {
        const cycles = await readJSON('cycles.json');
        res.json(cycles);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST - Initialiser les cycles
app.post('/api/cycles/initialize', async (req, res) => {
    try {
        const config = await readJSON('config.json');
        const startDate = new Date(config.startDate);
        const cycles = [];

        for (let i = 0; i < 10; i++) {
            const cycleStart = new Date(startDate);
            cycleStart.setDate(startDate.getDate() + (i * config.cycleDuration));
            const cycleEnd = new Date(cycleStart);
            cycleEnd.setDate(cycleStart.getDate() + config.cycleDuration - 1);

            cycles.push({
                id: i + 1,
                startDate: cycleStart.toISOString().split('T')[0],
                endDate: cycleEnd.toISOString().split('T')[0],
                beneficiaryId: null,
                amount: config.cycleAmount * config.memberCount,
                status: i === 0 ? 'En cours' : 'En attente',
                completed: false,
                completedAt: null
            });
        }

        await writeJSON('cycles.json', cycles);
        res.json(cycles);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT - Mettre à jour un cycle
app.put('/api/cycles/:id', async (req, res) => {
    try {
        const cycles = await readJSON('cycles.json');
        const index = cycles.findIndex(c => c.id === parseInt(req.params.id));
        if (index === -1) {
            return res.status(404).json({ error: 'Cycle non trouvé' });
        }
        cycles[index] = { ...cycles[index], ...req.body };
        await writeJSON('cycles.json', cycles);
        res.json(cycles[index]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET - Récupérer tous les paiements
app.get('/api/payments', async (req, res) => {
    try {
        const payments = await readJSON('payments.json');
        res.json(payments);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST - Enregistrer un paiement
app.post('/api/payments', async (req, res) => {
    try {
        const payments = await readJSON('payments.json');
        const { cycleId, memberId, day, amount } = req.body;
        const key = `${cycleId}-${memberId}-${day}`;
        payments[key] = {
            amount: parseInt(amount),
            timestamp: new Date().toISOString()
        };
        await writeJSON('payments.json', payments);
        res.json({ key, ...payments[key] });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET - Récupérer la configuration
app.get('/api/config', async (req, res) => {
    try {
        const config = await readJSON('config.json');
        res.json(config);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT - Mettre à jour la configuration
app.put('/api/config', async (req, res) => {
    try {
        const config = await readJSON('config.json');
        const updatedConfig = { ...config, ...req.body };
        await writeJSON('config.json', updatedConfig);
        res.json(updatedConfig);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST - Tirer au sort l'ordre des bénéficiaires
app.post('/api/draw-beneficiaries', async (req, res) => {
    try {
        const members = await readJSON('members.json');
        const cycles = await readJSON('cycles.json');
        const config = await readJSON('config.json');

        // Mélanger les membres
        const shuffled = [...members].sort(() => Math.random() - 0.5);
        const order = shuffled.map(m => m.id);

        // Mettre à jour les cycles avec les bénéficiaires
        cycles.forEach((cycle, index) => {
            if (index < order.length) {
                cycle.beneficiaryId = order[index];
            }
        });

        // Sauvegarder
        config.beneficiaryOrder = order;
        await writeJSON('config.json', config);
        await writeJSON('cycles.json', cycles);

        res.json({ order, cycles });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST - Terminer un cycle
app.post('/api/cycles/:id/complete', async (req, res) => {
    try {
        const cycleId = parseInt(req.params.id);
        const cycles = await readJSON('cycles.json');
        const config = await readJSON('config.json');
        const payments = await readJSON('payments.json');

        // Calculer le total collecté
        const members = await readJSON('members.json');
        let totalCollected = 0;
        members.forEach(member => {
            for (let day = 1; day <= 10; day++) {
                const key = `${cycleId}-${member.id}-${day}`;
                if (payments[key]) {
                    totalCollected += payments[key].amount;
                }
            }
        });

        // Vérifier si le montant est suffisant
        const targetAmount = config.cycleAmount * config.memberCount;
        if (totalCollected < targetAmount) {
            return res.status(400).json({ 
                error: 'Montant insuffisant', 
                collected: totalCollected,
                target: targetAmount
            });
        }

        // Mettre à jour les cycles
        const cycleIndex = cycles.findIndex(c => c.id === cycleId);
        if (cycleIndex !== -1) {
            cycles[cycleIndex].status = 'Terminé';
            cycles[cycleIndex].completed = true;
            cycles[cycleIndex].completedAt = new Date().toISOString();
            cycles[cycleIndex].amount = totalCollected;
        }

        // Activer le cycle suivant
        const nextCycleIndex = cycles.findIndex(c => c.id === cycleId + 1);
        if (nextCycleIndex !== -1) {
            cycles[nextCycleIndex].status = 'En cours';
            config.currentCycle = cycleId + 1;
        }

        await writeJSON('cycles.json', cycles);
        await writeJSON('config.json', config);

        res.json({ 
            message: 'Cycle terminé avec succès',
            cycle: cycles[cycleIndex],
            totalCollected
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET - Statistiques globales
app.get('/api/stats', async (req, res) => {
    try {
        const members = await readJSON('members.json');
        const cycles = await readJSON('cycles.json');
        const payments = await readJSON('payments.json');
        const config = await readJSON('config.json');

        const currentCycle = cycles.find(c => c.id === config.currentCycle);
        let totalCollected = 0;

        if (currentCycle) {
            members.forEach(member => {
                for (let day = 1; day <= 10; day++) {
                    const key = `${config.currentCycle}-${member.id}-${day}`;
                    if (payments[key]) {
                        totalCollected += payments[key].amount;
                    }
                }
            });
        }

        const completedCycles = cycles.filter(c => c.completed).length;
        const targetAmount = config.cycleAmount * config.memberCount;

        res.json({
            totalMembers: members.length,
            currentCycle: config.currentCycle,
            completedCycles,
            totalCollected,
            targetAmount,
            progress: (totalCollected / targetAmount) * 100,
            beneficiaryOrder: config.beneficiaryOrder
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Démarrage du serveur
const startServer = async () => {
    await initDataFiles();
    app.listen(PORT, () => {
        console.log(`
╔════════════════════════════════════════╗
║   🎯 Serveur Tontine démarré !        ║
║                                        ║
║   📡 Port: ${PORT}                        ║
║   🌐 URL: http://localhost:${PORT}       ║
║   📁 Données: ./data/                  ║
║                                        ║
║   ✅ API REST disponible               ║
╚════════════════════════════════════════╝
        `);
    });
};

startServer();
