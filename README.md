# DC AirBnB


## Table of Contents

- [Description](#description)
- [Usage](#usage)
- [Gallery](#gallery)
- [Certificates](#certificates)
- [References](#references)
- [Licenses](#licenses)
- [Acknowledgements](#acknowledgements)
- [Author](#author)

## Description

A detialed analysis of Washington D.C.'s AirBnB's, offering a wide variety of metrics for evaluating the vacation rental market in Washington, DC., utilizing a PostgreSQL database to conduct an exploratory data analysis and present interactive visualiztions to communicate the findings via a live website and a Tableau explanatory data analysis.

The website is configured to run from the client-side only on GitHub Pages. A Flask app and Django version are also developed to create server-side versions, the Flask app pulling from the PostgreSQL database, and the Django version pulling from a SQLite database.

Further analysis will continue after using an API to extract data from the federal census bureau and local DC city government, to compare the impact of the rental market on housing availability and affordability.

## Usage

The `/docs/` folder contains a GitHub Pages version of the interactive website, hosted live at [johbry17.github.io/DC-AirBnB-Data/](https://johbry17.github.io/DC-AirBnB-Data/). Click on the website and navigate around it. Interact with the charts and map to gather information and evaluate AirBnB's in DC.

A Tableau explanatory data analysis is embedded within the website, and can also be found online at [public.tableau.com/app/profile/bryan.johns6699/viz/DC-Airbnb/DCAirbnbMobile](https://public.tableau.com/app/profile/bryan.johns6699/viz/DC-Airbnb/DCAirbnbMobile). A copy is stored in the root repo as `DC-Airbnb.twbx`.

It all began with an exploratory data analysis, located at `/exploratory_data_analysis/eda.ipynb`.

`/django/django_airbnb_dc/python manage.py runserver` deploys a Django version of the website. `/flask/app.py` activates a Flask server that launches a full stack version of the website.

`airbnb.backup` is a backup of the database, that a user can load into a PostgreSQL database. Command line restore syntax: `pg_restore -U username -d dbname -1 /path/to/backup/file`.

### Note to self: If updating data...
---

Check for changes at the top of `data_processing.ipynb`. `Run All` to update the data source for both the Flask and GitHub Pages versions of this project. Update the annotations in the `price_availability` JavaScript plot.

Note any alterations necessary to `schema.sql` and `data_processing.ipynb` (the `paths` or `neighbourhoods_dict` at the top), both located in `/resources/data/cleaned_data/`. Pay particular attention to the `map_listings` and `price_availability` views, as they are exported to csv's for GitHub Pages. Don't update Tableau, leave as June 2024.

Don't forget to .gitignore any files over 100MB.

---

The ETL process depicted in `data_processing.ipynb` served as the final project for [cs50's Introduction to Databases with SQL](https://cs50.harvard.edu/sql/2024/), which can be found in my [DC-AirBnB-SQL-Database](https://github.com/johbry17/DC-AirBnB-SQL-Database) repo. The Jupyter Notebook not only cleans the data, it automatically loads a PostgreSQL database and extracts relevant data into csv's for the GitHub Pages version of the site, neatly preparing the data for the full-stack Flask version and the static, front-end-only version. The Tableau exploratory data analysis uses the same csv's.

### Errata

The price-availability plot in the Flask app has formatting issues, and the annotations are off. Remember to toggle between data filters for allDCData in plotPriceAvailability() for Flask and GitHub Pages.

## Gallery

Tableau:

![Tableau Plot](./resources/images/dc_airbnb_tableau_rental_type.png)

Web Plot:

![Website Plot of Price and Availability, Upcoming Year](./resources/images/dc_airbnb_price_availability_plot.png)

Web Map Images:

![Map](./resources/images/map.png)

![Map of Neighborhood](./resources/images/dc_airbnb_neighborhood.png)

![Neighborhood Map Color Coded by Rental Type](./resources/images/dc_airbnb_neighborhood_alt.png)

![Choropleth Map of Average Price per Neighborhood](./resources/images/choropleth.png)

![Bubble Map of Number of AirBnB's per Neighborhood](./resources/images/bubble.png)
Exploratory Data Analysis:

![Price Plot](./resources/images/dc_airbnb_price.png)

![Average Neighborhood Price Plot](./resources/images/dc_airbnb_avg_price.png)

Entity Relationship Diagram:

![ERD](./resources/images/ERD.png)

## Certificates

Parts of this project served as capstone's for two courses, the Django version for [cs50’s Web Programming with Python and JavaScript](https://cs50.harvard.edu/web/2020/), and the PostgreSQL database for [cs50's Introduction to Databases with SQL](https://cs50.harvard.edu/sql/2024/).

![cs50 Web Certificate](./resources/images/CS50W.png)

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
