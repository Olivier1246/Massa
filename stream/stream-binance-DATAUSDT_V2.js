//imperatif en debut de fichier
require('dotenv').config();

const { StreamrClient } = require('@streamr/sdk');

// Création du client Streamr
const streamr = new StreamrClient({
    auth: {
        privateKey: process.env.PRIVATE_KEY // Optionnel
    }
});

// Fonction pour formater les nombres
const formatPrice = (price) => price.toFixed(5);
const formatVolume = (volume) => volume.toLocaleString('en-US', { maximumFractionDigits: 2 });
const formatPercent = (percent) => percent.toFixed(2) + '%';

// Function principale
async function subscribeToBinanceData() {
    try {
        const subscription = await streamr.subscribe(
            'binance-streamr.eth/DATAUSDT/ticker',
            (message) => {
                console.log('\n=== DATAUSDT Ticker ===');
                console.log(`Timestamp: ${new Date().toISOString()}`);
                
                // Prix actuels
                console.log('\n📊 PRIX ACTUELS');
                console.log(`Meilleur Achat (Bid): ${formatPrice(message.bestBid)} USDT (Qté: ${formatVolume(message.bestBidQuantity)})`);
                console.log(`Meilleur Vente (Ask): ${formatPrice(message.bestAskPrice)} USDT (Qté: ${formatVolume(message.bestAskQuantity)})`);
                console.log(`Spread: ${formatPrice(message.bestAskPrice - message.bestBid)} USDT`);

                // Variations
                const priceChangeColor = message.priceChange >= 0 ? '\x1b[32m' : '\x1b[31m';
                console.log('\n📈 VARIATIONS (24h)');
                console.log(`Variation: ${priceChangeColor}${formatPrice(message.priceChange)} USDT (${formatPercent(message.priceChangePercent)})\x1b[0m`);
                console.log(`Prix moyen pondéré: ${formatPrice(message.weightedAveragePrice)} USDT`);

                // Range de la période
                console.log('\n📉 RANGE (24h)');
                console.log(`Ouverture: ${formatPrice(message.open)} USDT`);
                console.log(`Plus Haut: ${formatPrice(message.high)} USDT`);
                console.log(`Plus Bas: ${formatPrice(message.low)} USDT`);
                console.log(`Dernier: ${formatPrice(message.currentClose)} USDT`);

                // Volume
                console.log('\n💹 VOLUME (24h)');
                console.log(`Volume DATA: ${formatVolume(message.baseAssetVolume)} DATA`);
                console.log(`Volume USDT: ${formatVolume(message.quoteAssetVolume)} USDT`);
                console.log(`Nombre de trades: ${message.trades.toLocaleString()}`);
                
                console.log('\n===================');
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
            console.log('\nArrêt du client...');
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