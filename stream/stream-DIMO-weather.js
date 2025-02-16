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
async function subscribeToWeatherData() {
    try {
        // S'abonner au stream avec gestion d'erreur via try/catch
        const subscription = await streamr.subscribe(
            'streams.dimo.eth/firehose/weather',
            (message) => {
                // Traitement des données reçues
                console.log('Données météo reçues:', {
                    timestamp: message.timestamp,
                    temperature: message.temperature,
                    humidity: message.humidity,
                    pressure: message.pressure,
                    location: message.location
                });
            }
        );

        console.log('Abonnement réussi au flux météo');

        // Retourner la subscription pour pouvoir l'arrêter plus tard si nécessaire
        return subscription;

    } catch (error) {
        console.error('Erreur lors de l\'abonnement:', error);
        throw error; // Propager l'erreur pour la gestion en amont si nécessaire
    }
}

// Démarrage avec gestion d'erreur globale
async function start() {
    try {
        const subscription = await subscribeToWeatherData();
        
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