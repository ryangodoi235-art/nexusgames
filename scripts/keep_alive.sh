#!/bin/bash
while true; do
    curl -s https://nexusgames-api.onrender.com/api/teste > /dev/null
    echo "$(date): Ping realizado"
    sleep 600  # 10 minutos
done
