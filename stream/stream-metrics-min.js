//imperatif en debut de fichier
require('dotenv').config();

const { StreamrClient } = require('@streamr/sdk');

// Création du client Streamr
const streamr = new StreamrClient({
    auth: {
        privateKey: process.env.PRIVATE_KEY // Optionnel
    }
});

// Fonction pour formater les nombres avec 2 décimales
const formatNumber = (num) => Number(num.toFixed(2));

// Function principale
async function subscribeToNodeMetrics() {
    try {
        const subscription = await streamr.subscribe(
            'streamr.eth/metrics/nodes/firehose/min',
            (message) => {
                // Formatage des données pour une meilleure lisibilité
                const formattedMetrics = {
                    timestamp: message.timestamp,
                    period: {
                        start: new Date(message.period.start).toISOString(),
                        end: new Date(message.period.end).toISOString()
                    },
                    node: {
                        id: message.node.id,
                        broadcast: {
                            messages: formatNumber(message.node.broadcastMessagesPerSecond) + ' msg/s',
                            bandwidth: formatNumber(message.node.broadcastBytesPerSecond / 1024) + ' KB/s'
                        },
                        send: {
                            messages: formatNumber(message.node.sendMessagesPerSecond) + ' msg/s',
                            bandwidth: formatNumber(message.node.sendBytesPerSecond / 1024) + ' KB/s'
                        },
                        receive: {
                            messages: formatNumber(message.node.receiveMessagesPerSecond) + ' msg/s',
                            bandwidth: formatNumber(message.node.receiveBytesPerSecond / 1024) + ' KB/s'
                        },
                        connections: {
                            average: formatNumber(message.node.connectionAverageCount),
                            failures: message.node.connectionTotalFailureCount
                        }
                    }
                };

                console.log('\n=== Métriques du Nœud ===');
                console.log(`Timestamp: ${formattedMetrics.timestamp}`);
                console.log(`Période: ${formattedMetrics.period.start} à ${formattedMetrics.period.end}`);
                console.log(`\nID du nœud: ${formattedMetrics.node.id}`);
                console.log('\nBroadcast:');
                console.log(`  Messages: ${formattedMetrics.node.broadcast.messages}`);
                console.log(`  Bande passante: ${formattedMetrics.node.broadcast.bandwidth}`);
                console.log('\nEnvoi:');
                console.log(`  Messages: ${formattedMetrics.node.send.messages}`);
                console.log(`  Bande passante: ${formattedMetrics.node.send.bandwidth}`);
                console.log('\nRéception:');
                console.log(`  Messages: ${formattedMetrics.node.receive.messages}`);
                console.log(`  Bande passante: ${formattedMetrics.node.receive.bandwidth}`);
                console.log('\nConnexions:');
                console.log(`  Moyenne: ${formattedMetrics.node.connections.average}`);
                console.log(`  Échecs: ${formattedMetrics.node.connections.failures}`);
                console.log('========================\n');
            }
        );

        console.log('Abonnement réussi au flux de métriques des nœuds');
        return subscription;

    } catch (error) {
        console.error('Erreur lors de l\'abonnement:', error);
        throw error;
    }
}

// Démarrage avec gestion d'erreur globale
async function start() {
    try {
        const subscription = await subscribeToNodeMetrics();
        
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