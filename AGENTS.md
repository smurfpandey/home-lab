# home-lab

Ansible playbooks to set up a home server on Raspberry Pi.

> **Note:** The `terraform/` directory is deprecated and no longer in use. Ignore it.

## Commands

```shell
# Pre-commit checks (all files)
pre-commit run --all-files

# Ansible syntax check
ansible-playbook main.yml --syntax-check -i hosts.ini

# Ansible ping test
ansible pi3b,pi4 -m ping -i hosts.ini

# Run main playbook via Docker/Podman
podman compose run --rm control-machine --vault-password-file /tmp/ansible_vault_pass main.yml -i hosts.ini

# Encrypt a string with Ansible Vault
podman compose run --rm --entrypoint "ansible-vault encrypt_string --stdin-name <var_name>" control-machine
```

## Project Structure

```
ansible/
├── main.yml              # Main playbook (entry point)
├── ping.yml              # Connectivity test playbook
├── hosts.ini             # Inventory (pi3b, pi4)
├── group_vars/
│   └── all.yml           # Global variables (Vault-encrypted secrets)
├── handlers/
│   └── main.yml          # Shared service restart handlers
├── roles/                # 30+ Ansible roles
├── .env.example          # Environment variable template
├── servers.toml          # Traefik backend/frontend config
├── traefik.toml          # Traefik static config
└── docker-compose.yml    # Ansible control machine container
```

## Coding Conventions

- **YAML:** 2-space indentation, start with `---`, use descriptive `- name:` for tasks
- **Shell:** Must pass `shellcheck`
- **Jinja2 templates:** Use `.j2` extension
- **Ansible roles** follow this pattern: create directory → pull Docker image → write `docker-compose.yml.j2` → write systemd service template → reload systemd → symlink service → enable/start
- **Tags** for selective execution: `tags: 'base'`, `tags: 'docker'`, etc.
- **Variables:** Use `group_vars/all.yml` for vars shared across multiple roles; use role `defaults/main.yml` for role-specific vars. Encrypt secrets with Ansible Vault.
- **Handlers:** Import from `handlers/main.yml` via `import_tasks`

## Environment

Required variables (set before running):

- `SUDO_PASS` — sudo password for target hosts
- `ANSIBLE_VAULT_PASS` — vault password for decrypting secrets

Optional (used by certain roles):

- `cloudflare_api_key`
- `cloudflare_api_email`

Copy `.env.example` to `.env` and fill in values. `.env` is gitignored.

## Security

- Never commit unencrypted secrets. Use `ansible-vault encrypt` for sensitive data in `group_vars/`.
- `.env` files are gitignored by design.
- Ansible Vault password must be provided at runtime via `ANSIBLE_VAULT_PASS`.

## Dev Environment

- `.devcontainer.json` provides a Python 3.13 + Ansible container environment
- Pre-commit hooks are configured in `.pre-commit-config.yaml`:
  - `trailing-whitespace`, `end-of-file-fixer`, `check-added-large-files`
  - `shellcheck` for shell scripts
- Install pre-commit: `pip install pre-commit && pre-commit install`
