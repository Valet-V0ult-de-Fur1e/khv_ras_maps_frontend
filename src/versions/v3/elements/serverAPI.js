const getServerAPIURL = (securityFlag=true) => {
    return securityFlag ? "https://195.133.198.89:8000" : "http://195.133.198.89:8000"
}

export default getServerAPIURL