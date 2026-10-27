# Postmortem: Ansible nie mógł odświeżyć cache apt na Raspberry Pi

Data: [data] · Host: pi (Debian 13 trixie) · Wpływ: playbook z rolą `base` nie przechodził; sam system działał normalnie.

## Objaw

Przebieg roli `base` kończył się błędem `Failed to update apt cache: unknown reason`. Wcześniejszy przebieg z `--check` zakończył się sukcesem.

## Przyczyna

`sudo apt update` na Pi pokazał, że repozytorium Cloudflare jest odrzucane: jego klucz używa podpisu SHA1, którego nowszy apt (weryfikacja przez `sqv`) już nie akceptuje. Repo zostało dodane dawno temu na potrzeby `cloudflared`. Ta usługa i tak była już nieużywana: logi pokazywały `Tunnel not found`, czyli tunel nie istniał.

## Jak to znalazłem

1. Ansible podał tylko ogólny błąd, więc uruchomiłem `apt update` ręcznie na Pi.
2. Komunikat wskazał na repo Cloudflare i odrzucony podpis.
3. Sprawdziłem, do czego służy to repo: `systemctl status cloudflared` i logi usługi.

## Naprawa

Zatrzymałem i usunąłem usługę `cloudflared`, odinstalowałem pakiet, usunąłem wpis repo i plik klucza z `/usr/share/keyrings/`. Po tym `apt update` przeszedł bez błędów, a playbook skończył się `changed=0` przy drugim przebiegu.

## Wnioski

- Tryb `--check` nie odświeża cache apt, więc nie wykrywa uszkodzonych repozytoriów. Zielony check nie oznacza, że prawdziwy przebieg się uda.
- Przed pierwszym uruchomieniem roli na hoście robię `sudo apt update` ręcznie i patrzę na ostrzeżenia.
- Nieużywane usługi i ich repozytoria usuwam, zamiast zostawiać „na później”. Każde dodatkowe repo to dodatkowe miejsce, które może się zepsuć.
