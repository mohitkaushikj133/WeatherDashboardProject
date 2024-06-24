from flask import Flask, request, jsonify
from flask_cors import CORS
import constants
from weather_api import BASE_URL, CURRENT_ENDPOINT, FORECAST_ENDPOINT
import requests
import os

app = Flask(__name__)
CORS(app)


@app.route('/weather', methods=['GET'])
def get_weather():
    cityName = request.args.get('city_name')

    if not cityName:
        return jsonify({'error': 'city_name is required'}), 400
    
    url = f'{BASE_URL}{CURRENT_ENDPOINT}?key={constants.API_KEY}&q={cityName}'

    headers = {'Content-Type': 'application/json'}

    response = requests.get(url, headers=headers)
    if response.status_code != 200:
        return jsonify({'error': 'Could not fetch weather data'}), response.status_code

    data = response.json()

    return jsonify({
        'location': data['location']['name'],
        'country': data['location']['country'],
        'timeZone': data['location']['tz_id'],
        'temperatureInCelcius': data['current']['temp_c'],
        'icon': data['current']['condition']['icon']
    })


@app.route('/weather/batch', methods=['POST'])
def get_weather_for_batch():
    locations = request.json.get('locations')

    if not locations:
        return jsonify({'error': 'locations is required'}), 400


    url = f'{BASE_URL}{CURRENT_ENDPOINT}?key={constants.API_KEY}&q=bulk'

    headers = {'Content-Type': 'application/json'}

    response = requests.post(url, json={'locations': locations}, headers=headers)
    if response.status_code != 200:
        return jsonify({'error': 'Could not fetch weather data'}), response.status_code

    data = response.json()

    apiRes = []
    for data in data['bulk']:
        query = data['query']
        if query:
            apiRes.append({
                'location': query['location']['name'],
                'country': query['location']['country'],
                'timeZone': query['location']['tz_id'],
                'temperatureInCelcius': query['current']['temp_c'],
                'icon': query['current']['condition']['icon']
            })
    return jsonify(apiRes)

@app.route('/weather/forecast', methods=['GET'])
def get_weather_forecast():
    days = request.args.get('days')
    cityName = request.args.get('city_name')

    if not cityName:
        return jsonify({'error': 'city_name is required'}), 400

    
    url = f'{BASE_URL}{FORECAST_ENDPOINT}?key={constants.API_KEY}&q={cityName}&days={days}'

    headers = {'Content-Type': 'application/json'}

    response = requests.get(url, headers=headers)

    
    if response.status_code != 200:
        return jsonify({'error': 'Could not fetch weather data'}), response.status_code

    data = response.json()

    forecastData = []

    for fData in data['forecast']['forecastday']:
        hourlyData = []
        for hourData in fData['hour']:
            hourlyData.append({
                'icon': hourData['condition']['icon'],
                'time': hourData['time'],
                'tempInCelcius': hourData['temp_c'],
            })

        forecastData.append({
              'date':   fData['date'],
              'maxTempInCelcius': fData['day']['maxtemp_c'],
              'minTempInCelcius': fData['day']['mintemp_c'],
              'avgTempInCelcius': fData['day']['avgtemp_c'],
              'icon': fData['day']['condition']['icon'],
              'hour': hourlyData
            })
    
    return jsonify({
        'location': data['location']['name'],
        'country': data['location']['country'],
        'timeZone': data['location']['tz_id'],
        'temperatureInCelcius': data['current']['temp_c'],
        'forecastData': forecastData
    })

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))

    app.run(host='0.0.0.0', port=port)
