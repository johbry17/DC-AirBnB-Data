# Generated by Django 5.0.6 on 2025-02-02 06:49

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("airbnb_data_hub_dc", "0004_alter_minmaxnight_minimum_nights"),
    ]

    operations = [
        migrations.AlterField(
            model_name="minmaxnight",
            name="minimum_nights",
            field=models.FloatField(),
        ),
    ]
