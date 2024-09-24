# DC AirBnB

## Ideas

Chloropleth map of price (ratings, number of listings, etc)?

Color code map markers by property type (entire home, room...)

Sorted list of Max/Median price per neighbourhood, highlight chosen neighbourhood

List top 10 hosts with most listings

check hosted vs unhosted license numbers - N.B.: some have both licenses, check for cases of both

<hr>
<hr>
<hr>

Development on this project has restarted.

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

A detialed analysis of Washington D.C.'s AirBnB's, offering a wide variety of metrics for evaluating the market for AirBnB's in Washington, DC., utilizing a PostgreSQL database to conduct an exploratory data analysis and present interactive visualiztions to communicate the findings via a live website and a Tableau explanatory data analysis.

## Usage

`/flask/app.py` will launch a Flask development server that you can use to host the website. Click on the website and navigate around it. Interact with the charts and tables and map to gather information and evaluate AirBnB's in DC.

The `/docs/` folder contains a GitHub Pages version of the same website, hosted live at [johbry17.github.io/DC-AirBnB-Data/](https://johbry17.github.io/DC-AirBnB-Data/).

`airbnb` is a backup of the database, that a user can load into a PostgreSQL database.

The `/resources/data` folder contains the csv's and SQL code used to create the database. `/resources/data/cleaned_data/data_cleaning.ipynb` shows the ETL process. This was the final project for [cs50's Introduction to Databases with SQL](https://cs50.harvard.edu/sql/2024/), which can be found in my [DC-AirBnB-SQL-Database](https://github.com/johbry17/DC-AirBnB-SQL-Database) repo. `data_cleaning.ipynb` not only cleans the data, it also automatically loads it into the PostgreSQL database, and extracts it into a csv for the GitHub Pages version of the site, neatly preparing the data for Flask version and the static version.

Don't forget to .gitignore any files over 100MB.

`/exploratory_data_analysis` contains `eda.ipynb`, showing the exploratory data analysis.

## Gallery

Map:

![Map](./flask/static/images/Map.png)

ERD:

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

Bryan Johns, September, 2024
