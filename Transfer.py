import requests

# Définissez l'URL de l'API
url = "http://192.168.0.145:53037/v1/nodes"

# Définissez les paramètres de la requête
params = {
    "address": "AU1xxxxxxpaV",
    "amount": 100,
    "destination": "AU1xxxxxxwmC"
}

# Envoyez la requête POST à l'API
response = requests.post(url, params=params)

# Vérifiez si la réponse est une erreur
if response.status_code == 400:
    print("Erreur :", response.text)
else:
    print("Requête POST effectuée avec succès")
