# DC AirBnB

## Ideas / Notes to self:

ADA aria-labels, toLocaleString

split ratings and avg price, hide ratings

add % difference neighborhood vs dc price (mean and median)

Chloropleth map of price (ratings, number of listings, etc)?

bubble plot on map, number of listings per neighborhood

Avg price by room type, avg price by license type

listings per minimum nights (with STR bar at 30 days)

Sorted list of Max/Median price per neighbourhood, highlight chosen neighbourhood

host number of listings (bar chart)

List top 10 hosts with most listings

Annotate price and availability over time

--

Use R to get data from local and federal government (Open DC and the census), do an exploratory data analysis, and add the results to the website / Tableau.

<hr>

Development on this project has restarted.

<hr>

## Table of Contents

- [Description](#description)
- [Usage](#usage)
- [Gallery](#gallery)
- [Certificate](#certificate)
- [References](#references)
- [Licenses](#licenses)
- [Acknowledgements](#acknowledgements)
- [Author](#author)

## Description

A detialed analysis of Washington D.C.'s AirBnB's, offering a wide variety of metrics for evaluating the vacation rental market in Washington, DC., utilizing a PostgreSQL database to conduct an exploratory data analysis and present interactive visualiztions to communicate the findings via a live website and a Tableau explanatory data analysis.

Further analysis will continue after using an API to extract data from the federal census bureau and local DC city government, to compare the impact of the rental market on housing availability and affordability.

## Usage

The `/docs/` folder contains a GitHub Pages version of the interactive website, hosted live at [johbry17.github.io/DC-AirBnB-Data/](https://johbry17.github.io/DC-AirBnB-Data/).

A Tableau explanatory data analysis is embedded within the website, and can also be found online at [public.tableau.com/app/profile/bryan.johns6699/viz/DC-Airbnb/DCAirbnbMobile](https://public.tableau.com/app/profile/bryan.johns6699/viz/DC-Airbnb/DCAirbnbMobile). A copy is stored in the root repo as `DC-Airbnb.twbx`.

It all began with an exploratory data analysis, located at `/exploratory_data_analysis/eda.ipynb`.

`/flask/app.py` will launch a Flask server that can host a full stack version of the website. Click on the website and navigate around it. Interact with the charts and map to gather information and evaluate AirBnB's in DC.

`airbnb.backup` is a backup of the database, that a user can load into a PostgreSQL database. Command line restore syntax: `pg_restore -U username -d dbname -1 /path/to/backup/file`.

### - Note to self: If updating data...

Run `data_cleaning.ipynb` to update the data source for both the Flask and GitHub Pages versions of this project. Make any alterations necessary to `schema.sql` and `data_cleaning.ipynb` (the `paths` or `neighbourhoods_dict` at the top), both located in `/resources/data/cleaned_data/`. Pay particular attention to the `map_listings` and `price_availability` views, as they are exported to csv's for GitHub Pages and Tableau.

Don't forget to .gitignore any files over 100MB.

The ETL process depicted in `data_cleaning.ipynb` served as the final project for [cs50's Introduction to Databases with SQL](https://cs50.harvard.edu/sql/2024/), which can be found in my [DC-AirBnB-SQL-Database](https://github.com/johbry17/DC-AirBnB-SQL-Database) repo. The Jupyter Notebook not only cleans the data, it automatically loads a PostgreSQL database and extracts relevant data into csv's for the GitHub Pages version of the site, neatly preparing the data for the full-stack Flask version and the static, front-end-only version. The Tableau exploratory data analysis uses the same csv's.

## Gallery

Tableau:

![Tableau Plot](./resources/images/dc_airbnb_tableau_rental_type.png)

Web Plot:

![Website Plot of Price and Availability, Upcoming Year](./resources/images/dc_airbnb_price_availability_plot.png)

Web Map Images:

![Map](./flask/static/images/Map.png)

![Map of Neighborhood](./resources/images/dc_airbnb_neighborhood.png)

![Neighborhood Map Color Coded by Rental Type](./resources/images/dc_airbnb_neighborhood_alt.png)

Exploratory Data Analysis:

![Price Plot](./resources/images/dc_airbnb_price.png)

![Average Neighborhood Price Plot](./resources/images/dc_airbnb_avg_price.png)

Entity Relationship Diagram:

![ERD](./flask/static/images/ERD.png)

## Certificate

![cs50SQL Certificate](./resources/images/CS50SQL.png)

## References

Dataset provided by [Inside AirBnB](http://insideairbnb.com/about/).

## Licenses

[Creative Commons Attribution 4.0 International License](http://creativecommons.org/licenses/by/4.0/)

## Acknowledgements

Sincerest thanks to Imen Najar for assistance on an early version of this project.

Thanks to Geronimo Perez for feedback and assistance.

## Author

Bryan Johns, October, 2024
