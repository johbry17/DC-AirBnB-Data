from flask import Flask, render_template,request,jsonify
from sqlalchemy import create_engine,text
import config

# # connect to database
DATABASE_URL = f'postgresql://postgres:{config.password}@localhost:5432/{config.database}'
engine = create_engine(DATABASE_URL)

app = Flask(__name__, template_folder='templates/')

# connects and queries database
def fetch(query):
    with engine.connect() as connection:
        with connection.begin():
            result = connection.execute(query)
            column_names = result.keys()
        return [dict(zip(column_names, row)) for row in result]
################

# html routes
@app.route('/')
def home():
    return render_template('index.html')

################

# app routes
# app routes
@app.route('/api/listings')
def get_listings():
    # hosts has nulls, so LEFT JOIN
    query = text(f"""SELECT * FROM listings
LEFT JOIN listing_description ON listings.listing_id = listing_description.id
LEFT JOIN listing_reviews ON listings.listing_id = listing_reviews.listing_id
LEFT JOIN hosts ON hosts.host_id = listings.host_id""")
    return jsonify(fetch(query))

@app.route('/api/listings1')
def get_listings1():
    # hosts has nulls, so LEFT JOIN
    query = text(f"""SELECT * FROM listings""")
    return jsonify(fetch(query))

@app.route('/api/listings_by_property_type')
def get_listings_by_property_type():
    query = text("""SELECT property_type, sum(number_of_reviews) as toltal_number_reviws_by_type_property 
                 FROM listings l, listing_reviews lr  WHERE l.listing_id = lr.listing_id   
                 GROUP BY property_type ORDER BY sum(number_of_reviews)DESC LIMIT 10""")
    return jsonify(fetch(query))

@app.route('/api/listings_by_neighborhood')
def get_listings_by_neighborhood():
    query = text("""SELECT neighbourhood_cleansed , sum(number_of_reviews) as toltal_number_reviws_by_neighborhood 
                 FROM listings l, listing_reviews lr  WHERE l.listing_id = lr.listing_id   
                 GROUP BY neighbourhood_cleansed  ORDER BY sum(number_of_reviews) DESC LIMIT 10;""")
    return jsonify(fetch(query))
   

@app.route('/api/price')
def get_price():
     query = text("select min (price), max(price)from listings where price >0;")
     return jsonify(fetch(query))

@app.route('/api/numberprice')
def get_num_price():
    query = text("SELECT price from listings;")
    return jsonify(fetch(query))

@app.route('/api/best_score')
def get_best_review():
    query = text("""SELECT lr.listing_id,availability_30,availability_60,availability_90,availability_365,instant_bookable,last_review
                 FROM listing_reviews lr,availability av
    where review_scores_rating=5 and av.id_listing=lr.listing_id;""")
    return jsonify(fetch(query))

@app.route('/api/expensive_neighborhood')
def get_expensive_nei():
    query = text("""SELECT ROUND(AVG(price), 2) as av, neighbourhood_cleansed
FROM listings
GROUP BY neighbourhood_cleansed
ORDER BY av
;""")
    return jsonify(fetch(query))

@app.route('/api/listings_info')
def get_listings_info():
    query = text("SELECT listing_id, neighbourhood_cleansed,property_type,bathrooms_text,bedrooms,beds,license,description FROM listings;")
    return jsonify(fetch(query))
@app.route('/api/room_type')
def get_room_type():
    query = text("""SELECT
    room_type,
    COUNT(room_type) AS room_type_count,
    ROUND((COUNT(room_type) * 100.0 / SUM(COUNT(room_type)) OVER ()), 2) AS room_type_percentage
FROM
    listings
GROUP BY
    room_type
ORDER BY room_type_percentage DESC;
""")
    return jsonify(fetch(query))

@app.route('/api/license')
def get_num_license():
    query = text("""SELECT
    COUNT(CASE WHEN license IS NULL THEN 1 END) AS null_license_count,
    COUNT(CASE WHEN license LIKE 'Hosted License%' THEN 1 END) AS hosted_license_count,
    COUNT(CASE WHEN license LIKE 'Unhosted License%' THEN 1 END) AS unhosted_license_count,
    COUNT(CASE WHEN license = 'Exempt' THEN 1 END) AS exempt_license_count,
    COUNT(CASE WHEN license NOT LIKE 'Hosted License%' 
                AND license NOT LIKE 'Unhosted License%' 
                AND license IS NOT NULL 
                AND license != 'Exempt' THEN 1 END) AS other_license_count
FROM listings;

""")
    return jsonify(fetch(query))
 
@app.route('/api/host_listings_count_entire_homes')
def get_host_listings_count_entire_homes():
    query = text("""select calculated_host_listings_count_entire_homes, count(calculated_host_listings_count_entire_homes) from  
calculated_host_listings
group by calculated_host_listings_count_entire_homes
order by calculated_host_listings_count_entire_homes limit 10;

""")
    return jsonify(fetch(query))

@app.route('/api/host_listings_count_private_rooms')
def get_host_listings_count_private_rooms():
    query = text("""select calculated_host_listings_count_private_rooms, count(calculated_host_listings_count_private_rooms) from  
calculated_host_listings
group by calculated_host_listings_count_private_rooms
order by calculated_host_listings_count_private_rooms limit 10;

""")
    return jsonify(fetch(query))

@app.route('/api/listings_count_shared_rooms')
def get_listings_count_shared_rooms():
    query = text("""select calculated_host_listings_count_shared_rooms, count(calculated_host_listings_count_shared_rooms) from  
calculated_host_listings
group by calculated_host_listings_count_shared_rooms
order by calculated_host_listings_count_shared_rooms limit 10
""")
    return jsonify(fetch(query))

@app.route('/api/price_adjustedPrice')
def get_price_adjustedPrice():
    query = text("""SELECT
    ROUND(AVG(NULLIF(REGEXP_REPLACE(price, '[^0-9.]', '', 'g'), '')::numeric), 2) AS average_price,
    ROUND(AVG(NULLIF(REGEXP_REPLACE(adjusted_price, '[^0-9.]', '', 'g'), '')::numeric), 2) AS average_adjusted_price
FROM calendar;	""")
    return jsonify(fetch(query))

@app.route('/api/host_info')
def get_host_info():
    query = text("select* from hosts")
    return jsonify(fetch(query))

@app.route('/api/min_max_night')
def get_min_max_night():
    query = text("select  max(maximum_maximum_nights),min( minimum_minimum_nights) from min_max_night;")
    return jsonify(fetch(query))

if __name__ == '__main__':
    app.run()

