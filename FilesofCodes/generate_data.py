import mysql.connector
from faker import Faker
import random

# MySQL bağlantısı kurun
db = mysql.connector.connect(
    host="localhost",
    user="mydatabaseysf",
    password='Isdihayuha.2001',
    database='blog_db'
)

cursor = db.cursor()
fake = Faker()

# Büyük miktarda veri eklemek için bir script yazın
def add_data(num_titles, num_posts_per_title):
    for _ in range(num_titles):
        # Rastgele bir title oluşturun
        title = fake.sentence(nb_words=6)
        username = fake.user_name()
        
        # Title'ı veritabanına ekleyin
        cursor.execute("INSERT INTO titles (title, username) VALUES (%s, %s)", (title, username))
        title_id = cursor.lastrowid
        
        # Her title için belirli sayıda post ekleyin
        for _ in range(num_posts_per_title):
            post_content = fake.paragraph(nb_sentences=5)
            post_username = username  # Aynı kullanıcıdan postlar
            cursor.execute("INSERT INTO posts (content, title_id, username) VALUES (%s, %s, %s)", 
                           (post_content, title_id, post_username))
        
        # Veritabanını güncelleyin
        db.commit()
        print(f"Added title {title_id} and its posts")

# 1 milyon title ve her birinin içinde 1000 post ekleyin
add_data(1000000, 1000)

# Bağlantıyı kapatın
cursor.close()
db.close()
