#!/usr/bin/env bash
# Standalone SSH diagnostic. Run as: bash scripts/ssh-debug.sh
# (or via the cmd shim: ssh-debug)

echo "=== environment ==="
echo "PWD:           $(pwd)"
echo "bash:          $(command -v bash 2>/dev/null || echo '(not found)')"
echo "ssh:           $(command -v ssh 2>/dev/null || echo '(not found)')"
echo "HOME:          ${HOME:-(unset)}"
echo "USERPROFILE:   ${USERPROFILE:-(unset)}"
echo "USER:          ${USER:-(unset)}"
echo "USERNAME:      ${USERNAME:-(unset)}"
echo "SSH_AUTH_SOCK: ${SSH_AUTH_SOCK:-(unset)}"

echo
echo "=== ssh keys in \$HOME/.ssh ==="
if [ -n "${HOME:-}" ] && [ -d "$HOME/.ssh" ]; then
  ls -la "$HOME/.ssh/" | head -15
else
  echo "(\$HOME/.ssh does not exist)"
fi

echo
echo "=== ssh keys in C:/Users/home/.ssh (Windows path) ==="
ls -la "C:/Users/home/.ssh/" 2>&1 | head -15

echo
echo "=== ssh -vv probe to root@194.164.151.202 (last 40 lines) ==="
ssh -vv -o BatchMode=yes -o ConnectTimeout=10 root@194.164.151.202 "whoami" 2>&1 | tail -40

echo
echo "=== explicit key probe ==="
KEY="C:/Users/home/.ssh/synergy-deploy"
if [ -f "$KEY" ]; then
  echo "key exists at $KEY"
  ssh -o BatchMode=yes -o ConnectTimeout=10 -o IdentitiesOnly=yes -i "$KEY" root@194.164.151.202 "echo explicit-key-works" 2>&1
else
  echo "no key at $KEY — listing parent:"
  ls -la "C:/Users/home/.ssh/" 2>&1 | head
fi

echo
echo "=== exit ==="
