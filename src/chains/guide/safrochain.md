 

## 📋 Recommended Specifications

| Component | Minimum | Recommended |
| :-- | :-- | :-- |
| CPU | 4 Cores | 4+ Cores |
| RAM | 8 GB | 8+ GB |
| Storage | 400 GB SSD | 1 TB NVMe SSD |
| OS | Ubuntu 22.04 | Ubuntu 22.04 |
| Golang | 1.23.9 | 1.23.9+ |


---

## 🛠 Install Go (if not installed)

```bash
cd $HOME
VER="1.23.9"
wget "https://golang.org/dl/go$VER.linux-amd64.tar.gz"
sudo rm -rf /usr/local/go
sudo tar -C /usr/local -xzf "go$VER.linux-amd64.tar.gz"
rm "go$VER.linux-amd64.tar.gz"

[ ! -f ~/.bash_profile ] && touch ~/.bash_profile
echo "export PATH=\$PATH:/usr/local/go/bin:~/go/bin" >> ~/.bash_profile
source $HOME/.bash_profile
[ ! -d ~/go/bin ] && mkdir -p ~/go/bin
```


---

## ⚙️ Set Environment Variables

```bash
echo "export SAFRO_WALLET=<YOUR_WALLET>" >> $HOME/.bash_profile
echo "export SAFRO_MONIKER=<YOUR_MONIKER>" >> $HOME/.bash_profile
echo "export SAFRO_PORT=<CUSTOM_PORT>" >> $HOME/.bash_profile
echo "export SAFRO_CHAIN_ID=safro-testnet-1" >> $HOME/.bash_profile
source $HOME/.bash_profile
```


---

## 📥 Download Binary

```bash
cd $HOME
rm -rf safrochain-node
git clone https://github.com/Safrochain-Org/safrochain-node.git
cd safrochain-node
git checkout release/v0.1.0
make install
```


---

## 🔧 Init \& Config

```bash
safrochaind init $SAFRO_MONIKER --chain-id $SAFRO_CHAIN_ID
safrochaind config set client chain-id $SAFRO_CHAIN_ID
safrochaind config set client node tcp://localhost:${SAFRO_PORT}657
```


---

## 🌱 Download Genesis \& Addrbook

```bash
curl -Ls https://cdn.crxanode.com/safrochain/genesis.json > $HOME/.safrochain/config/genesis.json
curl -Ls https://cdn.crxanode.com/safrochain/addrbook.json > $HOME/.safrochain/config/addrbook.json
```


---

## 🔌 Custom Ports

```bash
sed -i.bak -e "s%:1317%:${SAFRO_PORT}317%g;
s%:8080%:${SAFRO_PORT}080%g;
s%:9090%:${SAFRO_PORT}090%g;
s%:9091%:${SAFRO_PORT}091%g;
s%:8545%:${SAFRO_PORT}545%g;
s%:8546%:${SAFRO_PORT}546%g;
s%:6065%:${SAFRO_PORT}065%g" $HOME/.safrochain/config/app.toml

sed -i.bak -e "s%:26658%:${SAFRO_PORT}658%g;
s%:26657%:${SAFRO_PORT}657%g;
s%:6060%:${SAFRO_PORT}060%g;
s%:26656%:${SAFRO_PORT}656%g;
s%^external_address = \"\"%external_address = \"$(wget -qO- eth0.me):${SAFRO_PORT}656\"%;
s%:26660%:${SAFRO_PORT}660%g" $HOME/.safrochain/config/config.toml
```


---

## 🗑 Pruning

```bash
sed -i -e "s/^pruning *=.*/pruning = \"custom\"/" $HOME/.safrochain/config/app.toml 
sed -i -e "s/^pruning-keep-recent *=.*/pruning-keep-recent = \"100\"/" $HOME/.safrochain/config/app.toml
sed -i -e "s/^pruning-interval *=.*/pruning-interval = \"10\"/" $HOME/.safrochain/config/app.toml
```


---

## ⛽ Min Gas, Prometheus, Indexer

```bash
sed -i 's|minimum-gas-prices =.*|minimum-gas-prices = "0.025usaf"|g' $HOME/.safrochain/config/app.toml
sed -i -e "s/prometheus = false/prometheus = true/" $HOME/.safrochain/config/config.toml
sed -i -e "s/^indexer *=.*/indexer = \"null\"/" $HOME/.safrochain/config/config.toml
```


---

## 🖥 Create Service File

```bash
sudo tee /etc/systemd/system/safrochaind.service > /dev/null <<EOF
[Unit]
Description=Safrochain
After=network-online.target
[Service]
User=$USER
ExecStart=$(which safrochaind) start
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
sudo systemctl enable safrochaind
sudo systemctl start safrochaind && sudo journalctl -u safrochaind -fo cat
```


---

## 📸 Snapshot

```bash
sudo apt install lz4 -y
sudo systemctl stop safrochaind
cp $HOME/.safrochain/data/priv_validator_state.json $HOME/.safrochain/priv_validator_state.json.backup
safrochaind tendermint unsafe-reset-all --home $HOME/.safrochain --keep-addr-book
curl -L https://cdn.crxanode.com/safrochain/safrochain-latest.tar.lz4 | lz4 -dc - | tar -xf - -C $HOME/.safrochain
mv $HOME/.safrochain/priv_validator_state.json.backup $HOME/.safrochain/data/priv_validator_state.json
sudo systemctl restart safrochaind && sudo journalctl -u safrochaind -fo cat
```


---

## 🔑 Create or Restore Wallet

**Create new wallet and save your mnemonics securely:**

```bash
safrochaind keys add $SAFRO_WALLET
```

**Restore wallet with:**

```bash
safrochaind keys add $SAFRO_WALLET --recover
```


---

## 🌍 Set keys variable environment

```bash
WALLET_ADDRESS=$(safrochaind keys show $SAFRO_WALLET -a)
VALOPER_ADDRESS=$(safrochaind keys show $SAFRO_WALLET --bech val -a)
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
  \"pubkey\": {\"@type\":\"/cosmos.crypto.ed25519.PubKey\",\"key\": \"$(safrochaind tendermint show-validator | grep -Po '\"key\":\\s*\"\\K[^\"]*')\"},
  \"amount\": \"1000000usaf\",
  \"moniker\": \"$SAFRO_MONIKER\",
  \"identity\": \"<YOUR_IDENTITY>\",
  \"website\": \"<YOUR_WEBSITE>\",
  \"security\": \"\",
  \"details\": \"<YOUR_DETAILS>\",
  \"commission-rate\": \"0.05\",
  \"commission-max-rate\": \"0.25\",
  \"commission-max-change-rate\": \"0.1\",
  \"min-self-delegation\": \"1\"
}" > validator.json

safrochaind tx staking create-validator validator.json \
    --from $SAFRO_WALLET \
    --chain-id $SAFRO_CHAIN_ID \
    --fees 5000usaf \
    --gas-adjustment 1.3 \
    --gas auto \
    -y
```


---

## ❌ Delete Node

⚠️ Backup your wallet \& `priv_validator_key.json` first!

```bash
sudo systemctl stop safrochaind
sudo systemctl disable safrochaind
sudo systemctl daemon-reload
sudo rm -rf /etc/systemd/system/safrochaind.service
sudo rm $(which safrochaind)
sudo rm -rf $HOME/.safrochain/
```


---

## 🔧 Service Operations

**Check logs**

```bash
sudo journalctl -u safrochaind -fo cat
```

**Check service status**

```bash
sudo systemctl status safrochaind
```

**Node info**

```bash
safrochaind status 2>&1 | jq
```

**Start service**

```bash
sudo systemctl start safrochaind
```

**Stop service**

```bash
sudo systemctl stop safrochaind
```

**Restart service**

```bash
sudo systemctl restart safrochaind
```

**Reload services**

```bash
sudo systemctl daemon-reload
```

**Enable service**

```bash
sudo systemctl enable safrochaind
```

**Disable service**

```bash
sudo systemctl disable safrochaind
```


---

## 🔑 Key Management

**Add New Wallet**

```bash
safrochaind keys add $SAFRO_WALLET
```

**Restore existing wallet (mnemonic)**

```bash
safrochaind keys add $SAFRO_WALLET --recover
```

**List All Wallets**

```bash
safrochaind keys list
```

**Delete wallet**

```bash
safrochaind keys delete $SAFRO_WALLET
```

**Check Balance**

```bash
safrochaind query bank balances $WALLET_ADDRESS
```

**Export Key (save to wallet.backup)**

```bash
safrochaind keys export $SAFRO_WALLET
```

**View EVM Private Key**

```bash
safrochaind keys unsafe-export-eth-key $SAFRO_WALLET
```

**Import Key (restore from wallet.backup)**

```bash
safrochaind keys import $SAFRO_WALLET wallet.backup
```


---

## 💰 Tokens

**Withdraw all rewards**

```bash
safrochaind tx distribution withdraw-all-rewards \
  --from $SAFRO_WALLET \
  --chain-id $SAFRO_CHAIN_ID \
  --gas auto --gas-adjustment 1.5 \
  --fees 5000usaf -y
```

**Withdraw rewards + commission (validator)**

```bash
safrochaind tx distribution withdraw-rewards $VALOPER_ADDRESS \
  --from $SAFRO_WALLET --commission \
  --chain-id $SAFRO_CHAIN_ID \
  --gas auto --gas-adjustment 1.5 \
  --fees 5000usaf -y
```

**Delegate to Yourself**

```bash
safrochaind tx staking delegate $(safrochaind keys show $SAFRO_WALLET --bech val -a) 1000000usaf \
  --from $SAFRO_WALLET --chain-id $SAFRO_CHAIN_ID \
  --gas auto --gas-adjustment 1.5 \
  --fees 5000usaf -y
```

**Delegate to another validator**

```bash
safrochaind tx staking delegate <TO_VALOPER_ADDRESS> 1000000usaf \
  --from $SAFRO_WALLET --chain-id $SAFRO_CHAIN_ID \
  --gas auto --gas-adjustment 1.5 \
  --fees 5000usaf -y
```

**Redelegate stake**

```bash
safrochaind tx staking redelegate $VALOPER_ADDRESS <TO_VALOPER_ADDRESS> 1000000usaf \
  --from $SAFRO_WALLET --chain-id $SAFRO_CHAIN_ID \
  --gas auto --gas-adjustment 1.5 \
  --fees 5000usaf -y
```

**Unbond**

```bash
safrochaind tx staking unbond $(safrochaind keys show $SAFRO_WALLET --bech val -a) 1000000usaf \
  --from $SAFRO_WALLET --chain-id $SAFRO_CHAIN_ID \
  --gas auto --gas-adjustment 1.5 \
  --fees 5000usaf -y
```

**Transfer funds**

```bash
safrochaind tx bank send $WALLET_ADDRESS <TO_WALLET_ADDRESS> 1000000usaf \
  --gas auto --gas-adjustment 1.5 \
  --fees 5000usaf -y
```


---

## 🛡️ Validator Operations

**Validator info (node status)**

```bash
safrochaind status 2>&1 | jq
```

**Validator details**

```bash
safrochaind q staking validator $VALOPER_ADDRESS
```

**Jailing info**

```bash
safrochaind q slashing signing-info $(safrochaind tendermint show-validator)
```

**Slashing parameters**

```bash
safrochaind q slashing params
```

**Unjail validator**

```bash
safrochaind tx slashing unjail \
  --from $SAFRO_WALLET \
  --chain-id $SAFRO_CHAIN_ID \
  --gas auto --gas-adjustment 1.5 \
  --fees 5000usaf -y
```

**Active Validators List**

```bash
safrochaind q staking validators -oj --limit=2000 |
jq '.validators[] | select(.status=="BOND_STATUS_BONDED")' |
jq -r '(.tokens|tonumber/pow(10;6)|floor|tostring) + " " + .description.moniker' |
sort -gr | nl
```

**Check Validator key**

```bash
[[ $(safrochaind q staking validator $VALOPER_ADDRESS -oj | jq -r .consensus_pubkey.key) =
   $(safrochaind status | jq -r .ValidatorInfo.PubKey.value) ]] &&
echo "Your key status is OK" || echo "Your key status is ERROR"
```

**Signing info**

```bash
safrochaind q slashing signing-info $(safrochaind tendermint show-validator)
```

**Edit Validator**

```bash
safrochaind tx staking edit-validator \
  --commission-rate 0.1 \
  --new-moniker "$SAFRO_MONIKER" \
  --identity "" \
  --details "Safrochain Node" \
  --from $SAFRO_WALLET \
  --chain-id $SAFRO_CHAIN_ID \
  --fees 5000usaf -y
```


---

## 🏛 Governance

**Proposals List**

```bash
safrochaind query gov proposals
```

**View proposal**

```bash
safrochaind query gov proposal 1
```

**Vote**

```bash
safrochaind tx gov vote 1 yes \
  --from $SAFRO_WALLET \
  --chain-id $SAFRO_CHAIN_ID \
  --gas auto --gas-adjustment 1.5 \
  --fees 5000usaf -y
```




