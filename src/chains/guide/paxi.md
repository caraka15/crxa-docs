

## 📋 Recommended Specifications
| Component | Minimum   | Recommended  |
|-----------|-----------|--------------|
| CPU       | 4 Cores   | 4+ Cores     |
| RAM       | 8 GB      | 8+ GB        |
| Storage   | 400 GB SSD| 1 TB NVMe SSD|
| OS        | Ubuntu 22.04 | Ubuntu 22.04 |

---

## 🛠 Install Go (if not installed)
```bash
cd $HOME
VER="1.24.4"
wget "https://golang.org/dl/go$VER.linux-amd64.tar.gz"
sudo rm -rf /usr/local/go
sudo tar -C /usr/local -xzf "go$VER.linux-amd64.tar.gz"
rm "go$VER.linux-amd64.tar.gz"

[ ! -f ~/.bash_profile ] && touch ~/.bash_profile
echo "export PATH=$PATH:/usr/local/go/bin:~/go/bin" >> ~/.bash_profile
source $HOME/.bash_profile
[ ! -d ~/go/bin ] && mkdir -p ~/go/bin
````

---

## ⚙️ Set Environment Variables

```bash
echo "export WALLET=<YOUR_WALLET>" >> $HOME/.bash_profile
echo "export MONIKER=<YOUR_MONIKER>" >> $HOME/.bash_profile
echo "export APP_PORT=<CUSTOM_PORT>" >> $HOME/.bash_profile
source $HOME/.bash_profile
```

---

## 📥 Download Binary

```bash
cd $HOME
rm -rf paxi
git clone https://github.com/paxi-web3/paxi.git
cd paxi
git checkout v1.0.6
go build -mod=readonly -tags "cosmwasm pebbledb" -o $HOME/go/bin/paxid ./cmd/paxid
```

---

## 🔧 Init & Config

```bash
paxid init $MONIKER --chain-id paxi-mainnet
paxid config set client chain-id paxi-mainnet
paxid config set client node tcp://localhost:${APP_PORT}657
```

---

## 🌱 Download Genesis & Addrbook

```bash
curl -Ls https://files.crxanode.me/paxi/genesis.json > ~/go/bin/paxi/config/genesis.json
curl -Ls https://files.crxanode.me/paxi/addrbook.json > ~/go/bin/paxi/config/addrbook.json
```

---

## 🔌 Custom Ports

```bash
# app.toml
sed -i.bak -e "s%:1317%:${APP_PORT}317%g;
s%:8080%:${APP_PORT}080%g;
s%:9090%:${APP_PORT}090%g;
s%:9091%:${APP_PORT}091%g;
s%:8545%:${APP_PORT}545%g;
s%:8546%:${APP_PORT}546%g;
s%:6065%:${APP_PORT}065%g" ~/go/bin/paxi/config/app.toml

# config.toml
sed -i.bak -e "s%:26658%:${APP_PORT}658%g;
s%:26657%:${APP_PORT}657%g;
s%:6060%:${APP_PORT}060%g;
s%:26656%:${APP_PORT}656%g;
s%^external_address = \"\"%external_address = \"$(wget -qO- eth0.me):${APP_PORT}656\"%;
s%:26660%:${APP_PORT}660%g" ~/go/bin/paxi/config/config.toml
```

---

## 🗑 Pruning

```bash
sed -i -e "s/^pruning *=.*/pruning = \"custom\"/" ~/go/bin/paxi/config/app.toml 
sed -i -e "s/^pruning-keep-recent *=.*/pruning-keep-recent = \"100\"/" ~/go/bin/paxi/config/app.toml
sed -i -e "s/^pruning-interval *=.*/pruning-interval = \"10\"/" ~/go/bin/paxi/config/app.toml
```

---

## ⛽ Min Gas, Prometheus, Indexer

```bash
sed -i 's|minimum-gas-prices =.*|minimum-gas-prices = "0.01upaxi"|g' ~/go/bin/paxi/config/app.toml
sed -i -e "s/prometheus = false/prometheus = true/" ~/go/bin/paxi/config/config.toml
sed -i -e "s/^indexer *=.*/indexer = \"null\"/" ~/go/bin/paxi/config/config.toml
```

---

## 🖥 Create Service File

```bash
sudo tee /etc/systemd/system/paxid.service > /dev/null <<EOF
[Unit]
Description=paxi
After=network-online.target
[Service]
User=$USER
ExecStart=$(which paxid) start
Restart=on-failure
RestartSec=3
LimitNOFILE=65535
[Install]
WantedBy=multi-user.target
EOF
```

---

## ▶️ Start Service

```bash
sudo systemctl daemon-reload
sudo systemctl enable paxid
sudo systemctl start paxid && sudo journalctl -u paxid -fo cat
```



## 📸 Snapshot

```bash
sudo apt install lz4 -y
sudo systemctl stop paxid
cp ~/go/bin/paxi/data/priv_validator_state.json ~/go/bin/paxi/priv_validator_state.json.backup
paxid tendermint unsafe-reset-all --home ~/go/bin/paxi --keep-addr-book
curl -L https://files.crxanode.me/paxi/paxi-latest.tar.lz4 | lz4 -dc - | tar -xf - -C ~/go/bin/paxi
mv ~/go/bin/paxi/priv_validator_state.json.backup ~/go/bin/paxi/data/priv_validator_state.json
sudo systemctl restart paxid && sudo journalctl -u paxid -fo cat
```

---

## 🔑 Create or Restore Wallet

**Create new wallet and save your mnemonics securely:**

```bash
paxid keys add $WALLET
```

**Restore wallet with:**

```bash
paxid keys add $WALLET --recover
```

---

## 🌍 Set keys variable environment

```bash
WALLET_ADDRESS=$(paxid keys show $WALLET -a)
VALOPER_ADDRESS=$(paxid keys show $WALLET --bech val -a)
echo "export WALLET_ADDRESS=$WALLET_ADDRESS" >> $HOME/.bash_profile
echo "export VALOPER_ADDRESS=$VALOPER_ADDRESS" >> $HOME/.bash_profile
source $HOME/.bash_profile
```

---

## 🏦 Create Validator

**After node synced fully:**

```bash
cd $HOME
echo "{
  \"pubkey\": {\"@type\":\"/cosmos.crypto.ed25519.PubKey\",\"key\": \"$(paxid tendermint show-validator | grep -Po '\"key\":\s*\"\K[^\"]*')\"},
  \"amount\": \"1000000upaxi\",
  \"moniker\": \"<YOUR_MONIKER>\",
  \"identity\": \"<YOUR_IDENTITY>\",
  \"website\": \"<YOUR_WEBSITE>\",
  \"security\": \"\",
  \"details\": \"<YOUR_DETAILS>\",
  \"commission-rate\": \"0.05\",
  \"commission-max-rate\": \"0.25\",
  \"commission-max-change-rate\": \"0.1\",
  \"min-self-delegation\": \"1\"
}" > validator.json

paxid tx staking create-validator validator.json \
    --from $WALLET \
    --chain-id paxi-mainnet \
    --fees 15000upaxi \
    --gas-adjustment 1.3 \
    --gas auto \
    -y
```

---

## ❌ Delete Node

⚠️ Backup your wallet & `priv_validator_key.json` first!

```bash
sudo systemctl stop paxid
sudo systemctl disable paxid
sudo systemctl daemon-reload
sudo rm -rf /etc/systemd/system/paxid.service
sudo rm $(which paxid)
sudo rm -rf ~/go/bin/paxi/
```



## 🔧 Service Operations

**Check logs**
```bash
sudo journalctl -u paxid -fo cat
````

**Check service status**

```bash
sudo systemctl status paxid
```

**Node info**

```bash
paxid status 2>&1 | jq
```

**Start service**

```bash
sudo systemctl start paxid
```

**Stop service**

```bash
sudo systemctl stop paxid
```

**Restart service**

```bash
sudo systemctl restart paxid
```

**Reload services**

```bash
sudo systemctl daemon-reload
```

**Enable service**

```bash
sudo systemctl enable paxid
```

**Disable service**

```bash
sudo systemctl disable paxid
```

---

## 🔑 Key Management

**Add New Wallet**

```bash
paxid keys add $WALLET
```

**Restore existing wallet (mnemonic)**

```bash
paxid keys add $WALLET --recover
```

**List All Wallets**

```bash
paxid keys list
```

**Delete wallet**

```bash
paxid keys delete $WALLET
```

**Check Balance**

```bash
paxid q bank balances $WALLET_ADDRESS
```

**Export Key (save to wallet.backup)**

```bash
paxid keys export $WALLET
```

**View EVM Private Key**

```bash
paxid keys unsafe-export-eth-key $WALLET
```

**Import Key (restore from wallet.backup)**

```bash
paxid keys import $WALLET wallet.backup
```

---

## 💰 Tokens

**Withdraw all rewards**

```bash
paxid tx distribution withdraw-all-rewards \
  --from $WALLET \
  --chain-id paxi-mainnet \
  --gas auto --gas-adjustment 1.5 \
  --fees 15000upaxi -y
```

**Withdraw rewards + commission (validator)**

```bash
paxid tx distribution withdraw-rewards $VALOPER_ADDRESS \
  --from $WALLET --commission \
  --chain-id paxi-mainnet \
  --gas auto --gas-adjustment 1.5 \
  --fees 15000upaxi -y
```

**Check your balance**

```bash
paxid query bank balances $WALLET_ADDRESS
```

**Delegate to Yourself**

```bash
paxid tx staking delegate $(paxid keys show $WALLET --bech val -a) 1000000upaxi \
  --from $WALLET --chain-id paxi-mainnet \
  --gas auto --gas-adjustment 1.5 \
  --fees 15000upaxi -y
```

**Delegate to another validator**

```bash
paxid tx staking delegate <TO_VALOPER_ADDRESS> 1000000upaxi \
  --from $WALLET --chain-id paxi-mainnet \
  --gas auto --gas-adjustment 1.5 \
  --fees 15000upaxi -y
```

**Redelegate stake**

```bash
paxid tx staking redelegate $VALOPER_ADDRESS <TO_VALOPER_ADDRESS> 1000000upaxi \
  --from $WALLET --chain-id paxi-mainnet \
  --gas auto --gas-adjustment 1.5 \
  --fees 15000upaxi -y
```

**Unbond**

```bash
paxid tx staking unbond $(paxid keys show $WALLET --bech val -a) 1000000upaxi \
  --from $WALLET --chain-id paxi-mainnet \
  --gas auto --gas-adjustment 1.5 \
  --fees 15000upaxi -y
```

**Transfer funds**

```bash
paxid tx bank send $WALLET_ADDRESS <TO_WALLET_ADDRESS> 1000000upaxi \
  --gas auto --gas-adjustment 1.5 \
  --fees 15000upaxi -y
```

---

## 🛡️ Validator Operations

**Validator info (node status)**

```bash
paxid status 2>&1 | jq
```

**Validator details**

```bash
paxid q staking validator $(paxid keys show $WALLET --bech val -a)
```

**Jailing info**

```bash
paxid q slashing signing-info $(paxid tendermint show-validator)
```

**Slashing parameters**

```bash
paxid q slashing params
```

**Unjail validator**

```bash
paxid tx slashing unjail \
  --from $WALLET \
  --chain-id paxi-mainnet \
  --gas auto --gas-adjustment 1.5 \
  --fees 15000upaxi -y
```

**Active Validators List**

```bash
paxid q staking validators -oj --limit=2000 \
| jq '.validators[] | select(.status=="BOND_STATUS_BONDED")' \
| jq -r '(.tokens|tonumber/pow(10;6)|floor|tostring) + " " + .description.moniker' \
| sort -gr | nl
```

**Check Validator key**

```bash
[[ $(paxid q staking validator $VALOPER_ADDRESS -oj | jq -r .consensus_pubkey.key) \
   = $(paxid status | jq -r .ValidatorInfo.PubKey.value) ]] \
&& echo "Your key status is OK" || echo "Your key status is ERROR"
```

**Signing info**

```bash
paxid q slashing signing-info $(paxid tendermint show-validator)
```

**Edit Validator**

```bash
paxid tx staking edit-validator \
  --commission-rate 0.1 \
  --new-moniker "$MONIKER" \
  --identity "" \
  --details "CrxaNode" \
  --from $WALLET \
  --chain-id paxi-mainnet \
  --fees 15000upaxi -y
```

---

## 🏛 Governance

**Proposals List**

```bash
paxid query gov proposals
```

**View proposal**

```bash
paxid query gov proposal 1
```

**Vote**

```bash
paxid tx gov vote 1 yes \
  --from $WALLET \
  --chain-id paxi-mainnet \
  --gas auto --gas-adjustment 1.5 \
  --fees 15000upaxi -y
```
