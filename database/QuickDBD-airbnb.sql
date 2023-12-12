-- Exported from QuickDBD: https://www.quickdatabasediagrams.com/
-- NOTE! If you have used non-SQL datatypes in your design, you will have to change these here.


SET XACT_ABORT ON

BEGIN TRANSACTION QUICKDBD

CREATE TABLE [listings] (
    [listing_id] BIGINT  NOT NULL ,
    [listing_name] VARCHAR  NOT NULL ,
    [description] VARCHAR(1500)  NOT NULL ,
    [listing_url] VARCHAR(1500)  NOT NULL ,
    [neighborhood_overview] VARCHAR  NOT NULL ,
    [picture_url] VARCHAR  NOT NULL ,
    [neighberhood] VARCHAR  NOT NULL ,
    [neighbourhood_cleansed] VARCHAR  NOT NULL ,
    [latitude] FLOAT  NOT NULL ,
    [longitude] FLOAT  NOT NULL ,
    [property_type] VARCHAR  NOT NULL ,
    [room_type] VARCHAR  NOT NULL ,
    [accommodates] VARCHAR  NOT NULL ,
    [bathrooms_text] VARCHAR  NOT NULL ,
    [bedrooms] varchar  NOT NULL ,
    [beds] decimal  NOT NULL ,
    [price] decimal  NOT NULL ,
    [license] VARCHAR  NOT NULL ,
    CONSTRAINT [PK_listings] PRIMARY KEY CLUSTERED (
        [listing_id] ASC
    )
)

CREATE TABLE [reviews] (
    [listing_id] BIGINT  NOT NULL ,
    [review_date] DATE  NOT NULL ,
    [reviewer_id] BIGINT  NOT NULL ,
    [reviewer_name] VARCHAR  NOT NULL ,
    [review_comments] VARCHAR  NOT NULL ,
    CONSTRAINT [PK_reviews] PRIMARY KEY CLUSTERED (
        [listing_id] ASC
    )
)

CREATE TABLE [hosts] (
    [host_id] BIGINT  NOT NULL ,
    [listing_id] BIGINT  NOT NULL ,
    [host_url] VARCHAR  NOT NULL ,
    [host_name] VARCHAR  NOT NULL ,
    [host_since] DATE  NOT NULL ,
    [host_location] VARCHAR  NOT NULL ,
    [host_about] VARCHAR  NOT NULL ,
    [host_response_time] VARCHAR  NOT NULL ,
    [host_response_rate] VARCHAR  NOT NULL ,
    [host_acceptance_rate] VARCHAR  NOT NULL ,
    [host_is_superhost] BOOLEAN  NOT NULL ,
    [host_thumbnail_url] VARCHAR  NOT NULL ,
    [host_picture_url] VARCHAR  NOT NULL ,
    [host_neighbourhood] VARCHAR  NOT NULL ,
    [host_listings_count] INT  NOT NULL ,
    [host_total_listings_count] INT  NOT NULL ,
    [host_verifications] VARCHAR  NOT NULL ,
    [host_has_profile_pic] BOOLEAN  NOT NULL ,
    [host_identity_verified] BOOLEAN  NOT NULL ,
    CONSTRAINT [PK_hosts] PRIMARY KEY CLUSTERED (
        [host_id] ASC
    )
)

CREATE TABLE [min_max_night] (
    [listing_id] BIGINT  NOT NULL ,
    [minimum_nights] DECIMAL  NOT NULL ,
    [maximum_nights] DECIMAL  NOT NULL ,
    [minimum_minimum_nights] DECIMAL  NOT NULL ,
    [maximum_minimum_nights] DECIMAL  NOT NULL ,
    [minimum_maximum_nights] DECIMAL  NOT NULL ,
    [maximum_maximum_nights] DECIMAL  NOT NULL ,
    [minimum_nights_avg_ntm] DECIMAL  NOT NULL ,
    [maximum_nights_avg_ntm] DECIMAL  NOT NULL ,
    CONSTRAINT [PK_min_max_night] PRIMARY KEY CLUSTERED (
        [listing_id] ASC
    )
)

CREATE TABLE [availability] (
    [id_listing] BIGINT  NOT NULL ,
    [has_availability] BOOLEAN  NOT NULL ,
    [availability_30] INT  NOT NULL ,
    [availability_60] INT  NOT NULL ,
    [availability_90] INT  NOT NULL ,
    [availability_365] INT  NOT NULL ,
    [calendar_last_scraped] DATE  NOT NULL ,
    [instant_bookable] BOOLEAN  NOT NULL ,
    CONSTRAINT [PK_availability] PRIMARY KEY CLUSTERED (
        [id_listing] ASC
    )
)

CREATE TABLE [listing_reviews] (
    [listing_id] BIGINT  NOT NULL ,
    [number_of_reviews] INT  NOT NULL ,
    [number_of_reviews_ltm] INT  NOT NULL ,
    [number_of_reviews_l30d] INT  NOT NULL ,
    [first_review] DATE  NOT NULL ,
    [last_review] DATE  NOT NULL ,
    [review_scores_rating] DECIMAL  NOT NULL ,
    [review_scores_accuracy] DECIMAL  NOT NULL ,
    [review_scores_cleanliness] DECIMAL  NOT NULL ,
    [review_scores_checkin] DECIMAL  NOT NULL ,
    [review_scores_communication] DECIMAL  NOT NULL ,
    [review_scores_location] DECIMAL  NOT NULL ,
    [reviews_per_month] DECIMAL  NOT NULL ,
    [review_scores_value] DECIMAL  NOT NULL ,
    CONSTRAINT [PK_listing_reviews] PRIMARY KEY CLUSTERED (
        [listing_id] ASC
    )
)

CREATE TABLE [calculated_host_listings] (
    [listing_id] BIGINT  NOT NULL ,
    [calculated_host_listings_count] INT  NOT NULL ,
    [calculated_host_listings_count_entire_homes] INT  NOT NULL ,
    [calculated_host_listings_count_private_rooms] INT  NOT NULL ,
    [calculated_host_listings_count_shared_rooms] INT  NOT NULL ,
    CONSTRAINT [PK_calculated_host_listings] PRIMARY KEY CLUSTERED (
        [listing_id] ASC
    )
)

CREATE TABLE [calendar] (
    [num] int  NOT NULL ,
    [listing_id] BIGINT  NOT NULL ,
    [date_a] DATE  NOT NULL ,
    [available] BOOLEAN  NOT NULL ,
    [price] VARCHAR  NOT NULL ,
    [adjusted_price] VARCHAR  NOT NULL ,
    [minimum_nights] INT  NOT NULL ,
    [maximum_nights] INT  NOT NULL ,
    CONSTRAINT [PK_calendar] PRIMARY KEY CLUSTERED (
        [num] ASC
    )
)

CREATE TABLE [listing_description] (
    [id] BIGINT  NOT NULL ,
    [hover_description] VARCHAR  NOT NULL ,
    CONSTRAINT [PK_listing_description] PRIMARY KEY CLUSTERED (
        [id] ASC
    )
)

ALTER TABLE [reviews] WITH CHECK ADD CONSTRAINT [FK_reviews_listing_id] FOREIGN KEY([listing_id])
REFERENCES [listings] ([listing_id])

ALTER TABLE [reviews] CHECK CONSTRAINT [FK_reviews_listing_id]

ALTER TABLE [hosts] WITH CHECK ADD CONSTRAINT [FK_hosts_listing_id] FOREIGN KEY([listing_id])
REFERENCES [listings] ([listing_id])

ALTER TABLE [hosts] CHECK CONSTRAINT [FK_hosts_listing_id]

ALTER TABLE [min_max_night] WITH CHECK ADD CONSTRAINT [FK_min_max_night_listing_id] FOREIGN KEY([listing_id])
REFERENCES [listings] ([listing_id])

ALTER TABLE [min_max_night] CHECK CONSTRAINT [FK_min_max_night_listing_id]

ALTER TABLE [availability] WITH CHECK ADD CONSTRAINT [FK_availability_id_listing] FOREIGN KEY([id_listing])
REFERENCES [listings] ([listing_id])

ALTER TABLE [availability] CHECK CONSTRAINT [FK_availability_id_listing]

ALTER TABLE [listing_reviews] WITH CHECK ADD CONSTRAINT [FK_listing_reviews_listing_id] FOREIGN KEY([listing_id])
REFERENCES [listings] ([listing_id])

ALTER TABLE [listing_reviews] CHECK CONSTRAINT [FK_listing_reviews_listing_id]

ALTER TABLE [calculated_host_listings] WITH CHECK ADD CONSTRAINT [FK_calculated_host_listings_listing_id] FOREIGN KEY([listing_id])
REFERENCES [listings] ([listing_id])

ALTER TABLE [calculated_host_listings] CHECK CONSTRAINT [FK_calculated_host_listings_listing_id]

ALTER TABLE [calendar] WITH CHECK ADD CONSTRAINT [FK_calendar_listing_id] FOREIGN KEY([listing_id])
REFERENCES [listings] ([listing_id])

ALTER TABLE [calendar] CHECK CONSTRAINT [FK_calendar_listing_id]

ALTER TABLE [listing_description] WITH CHECK ADD CONSTRAINT [FK_listing_description_id] FOREIGN KEY([id])
REFERENCES [listings] ([listing_id])

ALTER TABLE [listing_description] CHECK CONSTRAINT [FK_listing_description_id]

COMMIT TRANSACTION QUICKDBD