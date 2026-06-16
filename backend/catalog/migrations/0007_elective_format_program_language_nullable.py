from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('catalog', '0006_electivetrackexception'),
    ]

    operations = [
        migrations.AddField(
            model_name='elective',
            name='format',
            field=models.CharField(blank=True, max_length=10, choices=[('online', 'online'), ('offline', 'offline')], default=''),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name='elective',
            name='program_language',
            field=models.ForeignKey(null=True, blank=True, on_delete=django.db.models.deletion.CASCADE, to='catalog.programlanguage'),
        ),
    ]
