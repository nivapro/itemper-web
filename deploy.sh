#!/bin/bash
rm -r -f /usr/share/nginx/html/itemper/
echo "Files /itemper:"
ls -al /itemper

echo "Files /itemper/dist:"
ls -al /itemper/dist

cp -r /itemper/dist /usr/share/nginx/html/
