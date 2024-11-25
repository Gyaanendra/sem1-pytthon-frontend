from flask import Flask, render_template, jsonify
from flask_caching import Cache
import requests

app = Flask(__name__)

# Configure caching (simple cache for demonstration)
cache = Cache(app, config={'CACHE_TYPE': 'simple', 'CACHE_DEFAULT_TIMEOUT': 300})

# Function to load book data from an external API
def load_books():
    try:
        response = requests.get('https://sem1-project-api.onrender.com/api/books')  # Replace with your actual API URL
        response.raise_for_status()  # Raise an error for bad status codes
        books_data = response.json()  # Assuming the API returns JSON data
        return books_data
    except requests.RequestException as e:
        print(f"Error fetching books: {e}")
        return []  # Return an empty list on error

@app.route('/')
def index():
    return render_template('index.html')  # Static rendering of index

@app.route('/profile')
def profile():
    return render_template('profile.html')  # Static rendering of profile
@app.route('/admin')
def admin():
    return render_template('admin.html')  # Static rendering of profile

@app.route('/books')
@cache.cached()  # Cache the rendered page for improved performance
def books():
    return render_template('books.html')

@app.route('/get/books')
@cache.cached(timeout=1800)  # Cache the data from the API
def api_books():
    books_data = load_books()
    return jsonify(books_data)

if __name__ == '__main__':
    app.run(host="127.0.0.1", port=35498, debug=True)

