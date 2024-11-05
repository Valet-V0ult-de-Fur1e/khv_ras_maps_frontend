const getServerAPIURL = (isTest=true) => {
    return isTest ? "https://abgggc.ru": "https://195.133.198.89"
}

export default getServerAPIURL