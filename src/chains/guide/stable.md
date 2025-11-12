# Stable Node Installation Guide

This template captures the Stable dev team's installation flow. Follow every step sequentially to bring up a Stable testnet node with the latest pre-compiled binaries. Always double-check the current chain ID and parameters from the official **Testnet Information** page before proceeding.

---

## Prerequisites
- All Stable system requirements have been met (CPU, RAM, storage, network).
- Root or sudo access on the target server.
- Basic familiarity with the Linux terminal.
- `curl`, `wget`, `tar`, `unzip`, `sha256sum`, and `systemctl` installed.

---

## Installation Method (Precompiled Binaries Only)
Stable currently ships only signed, pre-built binaries. Building from source is not supported.

### Linux AMD64
```bash
# Download the latest AMD64 tarball and rename it for clarity
wget -O stabled-0.8.1-testnet-linux-amd64.tar.gz \
  https://stable-testnet-data.s3.us-east-1.amazonaws.com/stabled-latest-linux-amd64-testnet.tar.gz

# Extract and place the binary inside your PATH
tar -xvzf stabled-0.8.1-testnet-linux-amd64.tar.gz
sudo mv stabled /usr/bin/

# Verify the installation
stabled version
```

### Linux ARM64
```bash
wget -O stabled-0.8.1-testnet-linux-arm64.tar.gz \
  https://stable-testnet-data.s3.us-east-1.amazonaws.com/stabled-latest-linux-arm64-testnet.tar.gz

tar -xvzf stabled-0.8.1-testnet-linux-arm64.tar.gz
sudo mv stabled /usr/bin/

stabled version
```

---

## Node Initialization
> Note: Replace placeholders with your own values. Refer back to **Testnet Information** whenever a parameter (chain ID, peers, etc.) changes.

### Step 1: Set Node Name & Custom Ports
```bash
export MONIKER="your-node-name"
export STABLE_CHAIN_ID="stabletestnet_2201-1"
export STABLE_PORT=27           # Use the same custom-port logic as the safro guide

echo "export MONIKER=$MONIKER" >> ~/.bashrc
echo "export STABLE_CHAIN_ID=$STABLE_CHAIN_ID" >> ~/.bashrc
echo "export STABLE_PORT=$STABLE_PORT" >> ~/.bashrc
source ~/.bashrc
```

### Step 2: Initialize the Node
```bash
stabled init $MONIKER --chain-id $STABLE_CHAIN_ID
# Creates the ~/.stabled/ configuration directory
```

### Step 3: Download the Genesis File
```bash
mv ~/.stabled/config/genesis.json ~/.stabled/config/genesis.json.backup
wget https://stable-testnet-data.s3.us-east-1.amazonaws.com/stable_testnet_genesis.zip
unzip stable_testnet_genesis.zip
cp genesis.json ~/.stabled/config/genesis.json

# Verify the checksum
sha256sum ~/.stabled/config/genesis.json
# Expected: 66afbb6e57e6faf019b3021de299125cddab61d433f28894db751252f5b8eaf2
```

### Step 4: Download Optimized Configuration Files
```bash
wget https://stable-testnet-data.s3.us-east-1.amazonaws.com/rpc_node_config.zip
unzip rpc_node_config.zip

cp ~/.stabled/config/config.toml ~/.stabled/config/config.toml.backup
cp config.toml ~/.stabled/config/config.toml

# Ensure the moniker is correct
sed -i "s/^moniker = \".*\"/moniker = \"$MONIKER\"/" ~/.stabled/config/config.toml
```

### Step 5: Essential app.toml & config.toml Updates
The dev team requires JSON-RPC, P2P, and RPC sections to use the following defaults. The helper scripts below rewrite those blocks while also respecting your custom port prefix.

```bash
# app.toml JSON-RPC block (EVM compatibility)
python3 <<'PY'
import os, re, pathlib
home = pathlib.Path.home()
app_path = home / ".stabled" / "config" / "app.toml"
port = os.getenv("STABLE_PORT", "27")
json_rpc = f"""[json-rpc]
enable = true
address = "0.0.0.0:{port}545"
ws-address = "0.0.0.0:{port}546"
allow-unprotected-txs = true
"""
text = app_path.read_text()
pattern = r"(?ms)^\[json-rpc\][\s\S]*?(?=^\[|$)"
if re.search(pattern, text):
    text = re.sub(pattern, json_rpc + "\n", text, count=1)
else:
    text = text.rstrip() + "\n\n" + json_rpc + "\n"
app_path.write_text(text)
PY
```

```bash
# config.toml P2P and RPC blocks
python3 <<'PY'
import os, re, pathlib
home = pathlib.Path.home()
cfg_path = home / ".stabled" / "config" / "config.toml"
port = os.getenv("STABLE_PORT", "27")
p2p_block = """[p2p]
max_num_inbound_peers = 50
max_num_outbound_peers = 30
persistent_peers = "5ed0f977a26ccf290e184e364fb04e268ef16430@37.187.147.27:26656,128accd3e8ee379bfdf54560c21345451c7048c7@37.187.147.22:26656"
pex = true
"""
rpc_block = f"""[rpc]
laddr = "tcp://0.0.0.0:{port}657"
max_open_connections = 900
cors_allowed_origins = ["*"]  # Restrict for production as needed
"""
text = cfg_path.read_text()
text = re.sub(r"(?ms)^\[p2p\][\s\S]*?(?=^\[)", p2p_block + "\n", text, count=1)
text = re.sub(r"(?ms)^\[rpc\][\s\S]*?(?=^\[)", rpc_block + "\n", text, count=1)
cfg_path.write_text(text)
PY
```

### Step 6: Custom Port Rewrite (Same Logic as Safro)
Apply the standard port-offset pattern across both config files:

```bash
# app.toml custom ports
sed -i.bak -e "s%:1317%:${STABLE_PORT}317%g;
s%:8080%:${STABLE_PORT}080%g;
s%:9090%:${STABLE_PORT}090%g;
s%:9091%:${STABLE_PORT}091%g;
s%:8545%:${STABLE_PORT}545%g;
s%:8546%:${STABLE_PORT}546%g;
s%:6065%:${STABLE_PORT}065%g" ~/.stabled/config/app.toml

# config.toml custom ports
sed -i.bak -e "s%:26658%:${STABLE_PORT}658%g;
s%:26657%:${STABLE_PORT}657%g;
s%:6060%:${STABLE_PORT}060%g;
s%:26656%:${STABLE_PORT}656%g;
s%^external_address = \"\"%external_address = \"$(wget -qO- eth0.me):${STABLE_PORT}656\"%;
s%:26660%:${STABLE_PORT}660%g" ~/.stabled/config/config.toml
```

---

## Systemd Service Setup

### Step 1: Create the Service File
```bash
sudo tee /etc/systemd/system/stabled.service > /dev/null <<'EOF'
[Unit]
Description=Stable Daemon Service
After=network-online.target

[Service]
User=$USER
ExecStart=/usr/bin/stabled start --chain-id stabletestnet_2201-1
Restart=always
RestartSec=3
LimitNOFILE=65535
StandardOutput=journal
StandardError=journal
SyslogIdentifier=stabled

[Install]
WantedBy=multi-user.target
EOF
```

### Step 2: Enable and Start the Service
```bash
sudo systemctl daemon-reload
sudo systemctl enable stabled
sudo systemctl start stabled
sudo systemctl status stabled
sudo journalctl -u stabled -f
```

---

## Cosmovisor Setup (Recommended for Automatic Upgrades)

### Step 1: Install Cosmovisor
```bash
go install cosmossdk.io/tools/cosmovisor/cmd/cosmovisor@latest

# Or download the pre-built binary
wget https://github.com/cosmos/cosmos-sdk/releases/download/cosmovisor%2Fv1.7.0/cosmovisor-v1.7.0-linux-amd64.tar.gz
tar -xvzf cosmovisor-v1.7.0-linux-amd64.tar.gz
sudo mv cosmovisor /usr/bin/

cosmovisor version
```

### Step 2: Set Environment Variables
```bash
echo "# Cosmovisor Configuration" >> ~/.bashrc
echo "export DAEMON_NAME=stabled" >> ~/.bashrc
echo "export DAEMON_HOME=$HOME/.stabled" >> ~/.bashrc
echo "export DAEMON_ALLOW_DOWNLOAD_BINARIES=true" >> ~/.bashrc
echo "export DAEMON_RESTART_AFTER_UPGRADE=true" >> ~/.bashrc
echo "export DAEMON_LOG_BUFFER_SIZE=512" >> ~/.bashrc
echo "export UNSAFE_SKIP_BACKUP=true" >> ~/.bashrc
source ~/.bashrc
```

### Step 3: Prepare the Cosmovisor Directory Structure
```bash
mkdir -p ~/.stabled/cosmovisor/genesis/bin
mkdir -p ~/.stabled/cosmovisor/upgrades

cp /usr/bin/stabled ~/.stabled/cosmovisor/genesis/bin/
ln -s ~/.stabled/cosmovisor/genesis ~/.stabled/cosmovisor/current

ls -la ~/.stabled/cosmovisor/
cosmovisor run version
```

### Step 4: Set the Service Name (Optional)
```bash
export SERVICE_NAME=stable
echo "export SERVICE_NAME=$SERVICE_NAME" >> ~/.bashrc
source ~/.bashrc
```

### Step 5: Create the Cosmovisor Systemd Service
```bash
sudo tee /etc/systemd/system/${SERVICE_NAME}.service > /dev/null <<'EOF'
[Unit]
Description=Cosmovisor daemon
After=network-online.target

[Service]
Environment="DAEMON_NAME=stabled"
Environment="DAEMON_HOME=$HOME/.stabled"
Environment="DAEMON_RESTART_AFTER_UPGRADE=true"
Environment="DAEMON_ALLOW_DOWNLOAD_BINARIES=true"
Environment="DAEMON_LOG_BUFFER_SIZE=512"
Environment="UNSAFE_SKIP_BACKUP=true"
User=$USER
ExecStart=$(which cosmovisor) run start --chain-id stabletestnet_2201-1
Restart=always
RestartSec=3
LimitNOFILE=65535
StandardOutput=journal
StandardError=journal
SyslogIdentifier=${SERVICE_NAME}

[Install]
WantedBy=multi-user.target
EOF
```

### Step 6: Enable and Start Cosmovisor
```bash
sudo systemctl daemon-reload
sudo systemctl enable ${SERVICE_NAME}
sudo systemctl start ${SERVICE_NAME}
sudo systemctl status ${SERVICE_NAME}
sudo journalctl -u ${SERVICE_NAME} -f
```

---

## Snapshot Restore (Crxa CDN)
Use the same snapshot workflow as the safro guide, but point it to the Stable assets hosted on the Crxa CDN.

```bash
sudo apt install lz4 -y
sudo systemctl stop stabled

cp $HOME/.stabled/data/priv_validator_state.json \
   $HOME/.stabled/priv_validator_state.json.backup

stabled tendermint unsafe-reset-all --home $HOME/.stabled --keep-addr-book

curl -L https://cdn.crxanode.me/stable/stable-testnet-latest.tar.lz4 \
  | lz4 -dc - | tar -xf - -C $HOME/.stabled

mv $HOME/.stabled/priv_validator_state.json.backup \
   $HOME/.stabled/data/priv_validator_state.json

sudo systemctl restart stabled
sudo journalctl -u stabled -fo cat
```

Stay on top of future announcements from the Stable team for updated chain IDs, binaries, peers, and snapshot names.
