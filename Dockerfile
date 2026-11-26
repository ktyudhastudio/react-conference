# Hanya menyajikan hasil build (dist). Build dilakukan di CI, bukan di sini.
FROM nginx:1.27-alpine
COPY nginx.conf.template /etc/nginx/templates/default.conf.template
COPY dist /usr/share/nginx/html
