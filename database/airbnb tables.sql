DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS min_max_night;
DROP TABLE IF EXISTS availability;
DROP TABLE IF EXISTS listing_reviews;
DROP TABLE IF EXISTS calculated_host_listings;
Drop table IF EXISTS listing_description;
DROP TABLE IF EXISTS calendar;
DROP TABLE IF EXISTS listings;
DROP TABLE IF EXISTS hosts;

CREATE TABLE hosts(
	host_id BIGINT PRIMARY KEY,
	host_url VARCHAR,
	host_name VARCHAR,
	host_since DATE,
	host_location VARCHAR,
	host_about VARCHAR,
	host_response_time VARCHAR,
	host_response_rate VARCHAR,
	host_acceptance_rate VARCHAR,
	host_is_superhost BOOLEAN,
	host_thumbnail_url VARCHAR,
	host_picture_url VARCHAR,
	host_neighbourhood VARCHAR,
	host_listings_count INT,
	host_total_listings_count INT,
	host_verifications VARCHAR,
	host_has_profile_pic BOOLEAN,
	host_identity_verified BOOLEAN
);

CREATE TABLE listings(
	listing_id BIGINT PRIMARY KEY, 
	host_id BIGINT REFERENCES hosts,
	listing_name VARCHAR,
	description VARCHAR(1500),
	listing_url VARCHAR(1500),
	neighborhood_overview VARCHAR,
	picture_url VARCHAR,
	neighbourhood VARCHAR,
	neighbourhood_cleansed VARCHAR,
	latitude FLOAT,
	longitude FLOAT,
	property_type VARCHAR ,
	room_type VARCHAR,
	accommodates VARCHAR,
	bathrooms_text VARCHAR, 
	bedrooms varchar, 
	beds decimal,
	price decimal,
	license VARCHAR
);

CREATE TABLE reviews(
	review_id BIGINT PRIMARY KEY,
	listing_id BIGINT REFERENCES listings,
	review_date DATE,
	reviewer_id BIGINT,
	reviewer_name VARCHAR,
	review_comments VARCHAR
	
);

CREATE TABLE min_max_night(
	listing_id BIGINT PRIMARY KEY REFERENCES listings,
	minimum_nights DECIMAL,
    maximum_nights DECIMAL,
    minimum_minimum_nights DECIMAL,	
    maximum_minimum_nights DECIMAL,
    minimum_maximum_nights DECIMAL,
	maximum_maximum_nights DECIMAL,
    minimum_nights_avg_ntm DECIMAL,
    maximum_nights_avg_ntm DECIMAL
);
                                           
CREATE TABLE availability(
	id_listing BIGINT PRIMARY KEY REFERENCES listings,
	has_availability BOOLEAN,
	availability_30 INT,
    availability_60 INT,
	availability_90 INT,
    availability_365 INT,
	last_review DATE,
    instant_bookable BOOLEAN
);

CREATE TABLE listing_reviews (
	listing_id BIGINT PRIMARY KEY REFERENCES listings,
	number_of_reviews INT,
	number_of_reviews_ltm INT,
    number_of_reviews_l30d INT,
	first_review DATE,                        
	last_review DATE,
    review_scores_rating DECIMAL,
	review_scores_accuracy DECIMAL,
	review_scores_cleanliness DECIMAL,
	review_scores_checkin DECIMAL,
    review_scores_communication DECIMAL,
	review_scores_location DECIMAL,
	reviews_per_month DECIMAL,
	review_scores_value DECIMAL
);

CREATE TABLE calculated_host_listings(
	listing_id BIGINT PRIMARY KEY REFERENCES listings,
	calculated_host_listings_count INT,
	calculated_host_listings_count_entire_homes INT,
	calculated_host_listings_count_private_rooms INT,
	calculated_host_listings_count_shared_rooms INT
);

CREATE TABLE listing_description(
	id BIGINT PRIMARY KEY REFERENCES listings,
	hover_description VARCHAR
);
	
CREATE TABLE calendar (
	num int PRIMARY KEY,
	listing_id BIGINT REFERENCES listings,
	date DATE,
	available BOOLEAN,
	price VARCHAR,
	minimum_nights INT,
	maximum_nights INT
	);
