import os

file_path = "index.html"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Make animations faster
content = content.replace('data-aos-duration="1000"', 'data-aos-duration="600"')
content = content.replace('data-aos-duration="800"', 'data-aos-duration="500"')

# Reduce delays so they don't take ages to show up
content = content.replace('data-aos-delay="900"', 'data-aos-delay="400"')
content = content.replace('data-aos-delay="800"', 'data-aos-delay="350"')
content = content.replace('data-aos-delay="700"', 'data-aos-delay="300"')
content = content.replace('data-aos-delay="600"', 'data-aos-delay="250"')
content = content.replace('data-aos-delay="500"', 'data-aos-delay="200"')
content = content.replace('data-aos-delay="400"', 'data-aos-delay="150"')
content = content.replace('data-aos-delay="300"', 'data-aos-delay="150"')
content = content.replace('data-aos-delay="200"', 'data-aos-delay="100"')
content = content.replace('data-aos-delay="100"', 'data-aos-delay="50"')

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
print("Updated AOS delays in index.html")
