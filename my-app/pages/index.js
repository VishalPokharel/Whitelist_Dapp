import Head from "next/head";
import styles from "../styles/Home.module.css";
import Web3Modal from "web3modal";
import { providers, Contract } from "ethers";
 import { useEffect, useRef, useState } from "react";
import { WHITELIST_CONTRACT_ADDRESS, abi } from "../constants";

export default function Home() {

  const [numberOfWhitelisted, setnumberofWhitelisted] = useState(0);
  const [walletConnected,setWalletConnected] = useState(false);
  const [joinedWhitelist,setjoinedWhitelist]=useState(false);
  const [loading,setLoading] = useState(false);
  

  const Web3ModalRef = useRef();
 
   const [ens, setENS] = useState("");
  // Save the address of the currently connected account
  const [address, setAddress] = useState("");

  /**
   * Sets the ENS, if the current connected address has an associated ENS or else it sets
   * the address of the connected account
   */
  const setENSOrAddress = async (address, web3Provider) => {
    // Lookup the ENS related to the given address
    var _ens = await web3Provider.lookupAddress(address);
    // If the address has an ENS set the ENS or else just set the address
    if (_ens) {
      setENS(_ens);
    } else {
      setAddress(address);
    }
  };

  const getProviderOrSigner=async(needSigner = false)=>{
  try {
    const provider = await Web3ModalRef.current.connect();
    const web3Provider = new providers.Web3Provider(provider);

    const {chainId} = await web3Provider.getNetwork();
    if(chainId!==5){
        window.alert("change the network to goerli.");
        throw new Error("change the network to goerli")
    }
    if(needSigner){
      const signer= web3Provider.getSigner();
      return signer;
    }
    return web3Provider; 
  } catch (error) {
    console.error(error);
  }
  }

  const addAddressToWhitelist = async() =>{
    try {
      const signer =await getProviderOrSigner(true);
      const whitelistcontract= new Contract(
        WHITELIST_CONTRACT_ADDRESS,
        abi,
        signer
      );
      const tx = await whitelistcontract.addAddressToWhitelist();
      setLoading(true);
      await tx.wait();
      setLoading(false);
      await getNumberofWhitelisted();
      setjoinedWhitelist(true);
    } catch (error) {
        console.error(error);
    }
  }


  const checkIfAddressIsWhitelisted= async()=>{
    try {
      const signer = await getProviderOrSigner(true);
      const whitelistcontract= new Contract(
        WHITELIST_CONTRACT_ADDRESS,
        abi,
        signer
      );
        
      const address =await signer.getAddress();
      const _joinedWhitelist = await whitelistcontract.whitelistedAddresses(address);
      setjoinedWhitelist(_joinedWhitelist);
    } catch (error) {
      console.error(error)
    }
  }


  const getNumberofWhitelisted =async()=>{
    try {
      const provider = await getProviderOrSigner();
      const whitelistcontract = new Contract(
        WHITELIST_CONTRACT_ADDRESS,
        abi,
        provider
      );

      const _numberOfWhitelisted = await whitelistcontract.numAddressesWhitelisted();
      setnumberofWhitelisted(_numberOfWhitelisted);

    } catch (error) {
      console.error(error);
    }
  } 

  const connectWallet = async()=>{
    try {
        await getProviderOrSigner();
      
        setWalletConnected(true);
        checkIfAddressIsWhitelisted();
        getNumberofWhitelisted();
    } catch (err) {
      console.error(err);
      
    }
  }

  const renderButton = () =>{
    if(walletConnected){
      if(joinedWhitelist){
        return(
          <div className={styles.description}>
            thanks for joining to whitelist.
          </div>
        );
      }
      else if(loading){
        return(
          <button>Loading...</button>
        )
      }
      else{
        return(
          <button onClick={addAddressToWhitelist} className={styles.button} >
            Join the whitelist
          </button>
        );
      }
    }
    else{
      <button onClick={connectWallet} className={styles.button}>Connect Wallet</button>
    }
  }

  useEffect(() => {
    if(!walletConnected){
      Web3ModalRef.current = new Web3Modal({
        network: "goerli",
        providerOptions: {},
        disableInjectedProvider: false,
      });
      connectWallet();
    }
  
  }, [walletConnected])
  
  
  return(
    <div>
      <Head>
        <title>Whitelist Dapp</title>
   <div>{ens ? ens : address}!</div>
        <meta name="description" content="Whitelist-Dapp" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.main}>
        <div>
          <h1 className={styles.title}>Welcome to Crypto Devs!</h1>
          <div className={styles.description}>
            Its an NFT collection for developers in Crypto.
          </div>
          <div className={styles.description}>
            {numberOfWhitelisted} have already joined the Whitelist
          </div>
        </div>
        {renderButton()}
        <div>
          <img className={styles.image} src="./crypto-devs.svg" />
        </div>
      </div>

      <footer className={styles.footer}>
        Made with &#10084; by Crypto Devs
      </footer>
    </div>
  )
 }
