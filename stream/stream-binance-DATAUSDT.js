//imperatif en debut de fichier
require('dotenv').config();

const { StreamrClient } = require('@streamr/sdk');

// Création du client Streamr
const streamr = new StreamrClient({
    auth: {
        privateKey: process.env.PRIVATE_KEY // Optionnel
    }
});

// Function principale
async function subscribeToBinanceData() {
    try {
        // S'abonner au stream Binance
        const subscription = await streamr.subscribe(
            'binance-streamr.eth/DATAUSDT/ticker',
            (message) => {
                // Afficher le message brut pour debug
                console.log('Message brut reçu:', JSON.stringify(message, null, 2));
                
                // Afficher les données avec timestamp local
                console.log('Données du ticker reçues:', {
                    localTimestamp: new Date().toISOString(),
                    ...message  // Inclure toutes les propriétés du message
                });
                
                console.log('------------------------');
            }
        );

        console.log('Abonnement réussi au flux Binance DATAUSDT');
        return subscription;

    } catch (error) {
        console.error('Erreur lors de l\'abonnement:', error);
        throw error;
    }
}

// Démarrage avec gestion d'erreur globale
async function start() {
    try {
        const subscription = await subscribeToBinanceData();
        
        // Gestion propre de l'arrêt
        process.on('SIGINT', async () => {
            console.log('Arrêt du client...');
            await subscription.unsubscribe();
            await streamr.destroy();
            process.exit(0);
        });
    } catch (error) {
        console.error('Erreur fatale:', error);
        await streamr.destroy();
        process.exit(1);
    }
}

// Lancer le programme
start();