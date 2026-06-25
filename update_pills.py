import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

count = 0
def replace_pill(match):
    global count
    delay = (count % 10) * 100
    count += 1
    return '<span class="skill-pill" data-aos="fade-up" data-aos-duration="600" data-aos-delay="' + str(delay) + '">'

new_content = re.sub(r'<span class="skill-pill">', replace_pill, content)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(new_content)
