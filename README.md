# home-lab
Ansible playbooks to setup home-server on a raspberry pi


``` shell
# 1. Set sudo password on local machine env vars
> set SUDO_PASS=<sudo password> # Windows Command Prompt
> export SUDO_PASS=<sudo password> # Unix

# 2. Set ansible vault password
> set "ANSIBLE_VAULT_PASS=<vault pass>"
> export "ANSIBLE_VAULT_PASS=<vault pass>"

# 3. Run control machine via docker-compose
> docker-compose run --rm control-machine --vault-password-file /tmp/ansible_vault_pass site.yml -i hosts.ini
```

```
docker-compose run --rm --entrypoint "ansible-vault encrypt_string --stdin-name cloudflare_api_token" control-machine
```
