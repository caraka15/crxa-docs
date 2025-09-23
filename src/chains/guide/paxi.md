# PAXI Node — Installation

> Ubuntu 22.04, CPU 4C, RAM 8GB, Storage 200GB+, Go 1.22+

## Update & deps

```bash
sudo apt update && sudo apt install -y curl jq lz4 make
```

## Health checks

```bash
curl -s https://paxi-rpc.crxanode.me/status | jq
curl -s https://paxi-api.crxanode.me/cosmos/base/tendermint/v1beta1/blocks/latest | jq
```

## Installation Steps

### 1. Install Go

```bash
cd $HOME
wget "https://golang.org/dl/go1.22.0.linux-amd64.tar.gz"
sudo rm -rf /usr/local/go
sudo tar -C /usr/local -xzf "go1.22.0.linux-amd64.tar.gz"
rm "go1.22.0.linux-amd64.tar.gz"
```

Add to your profile:

```bash
echo 'export PATH=$PATH:/usr/local/go/bin:$HOME/go/bin' >> $HOME/.bashrc
source $HOME/.bashrc
```

### 2. Clone and Build

```bash
git clone https://github.com/paxi-network/paxi.git
cd paxi
make install
```

### 3. Initialize Node

```bash
paxid init "your-node-name" --chain-id paxi-1
```

### 4. Download Genesis

```bash
wget -O $HOME/.paxi/config/genesis.json https://example.com/paxi/genesis.json
```

### 5. Configure Peers

Add peers to your config:

```bash
peers="abcd1234@203.0.113.11:26656"
sed -i.bak -e "s/^persistent_peers *=.*/persistent_peers = \"$peers\"/" $HOME/.paxi/config/config.toml
```

### 6. Download Snapshot (Optional)

```bash
# Stop node if running
sudo systemctl stop paxid

# Download and extract snapshot
wget -O - https://cdn.example.com/paxi/snapshots/latest.tar.lz4 | lz4 -c -d - | tar -x -C $HOME/.paxi/

# Start node
sudo systemctl start paxid
```

### 7. Create Service

```bash
sudo tee /etc/systemd/system/paxid.service > /dev/null <<EOF
[Unit]
Description=PAXI Daemon
After=network-online.target

[Service]
User=$USER
ExecStart=$(which paxid) start
Restart=always
RestartSec=3
LimitNOFILE=65535

[Install]
WantedBy=multi-user.target
EOF
```

### 8. Start Service

```bash
sudo systemctl daemon-reload
sudo systemctl enable paxid
sudo systemctl start paxid
```

### 9. Check Logs

```bash
sudo journalctl -u paxid -f --no-hostname -o cat
```

## Useful Commands

Check sync status:
```bash
paxid status 2>&1 | jq .SyncInfo
```

Check node info:
```bash
paxid status 2>&1 | jq .NodeInfo
```

Check validator info:
```bash
paxid status 2>&1 | jq .ValidatorInfo
```