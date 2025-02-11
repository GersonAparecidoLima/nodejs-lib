import chalk from "chalk";

// Cache para armazenar os resultados das requisições
const cache = {};

function extraiLinks(arrLinks) {
  return arrLinks.map((objetoLink) => Object.values(objetoLink).join());
}

async function checaStatus(listaURLs) {
  const arrStatus = await Promise.all(
    listaURLs.map(async (url) => {
      // Verifica se o status do link já está no cache
      if (cache[url]) {
        // Retorna o status do cache se já estiver armazenado
        return cache[url];
      }

      try {
        const response = await fetch(url);
        const status = response.status;
        
        // Armazena o status no cache para futuras requisições
        cache[url] = status;
        return status;
      } catch (erro) {
        // Armazena o erro no cache também
        const erroMensagem = manejaErros(erro);
        cache[url] = erroMensagem;
        return erroMensagem;
      }
    })
  );
  return arrStatus;
}

function manejaErros(erro) {
  if (erro.cause.code === 'ENOTFOUND') {
    return chalk.red('Link não encontrado');
  } else if (erro.cause.code === 'ECONNREFUSED') {
    return chalk.yellow('Conexão recusada. O servidor pode estar indisponível');
  } else if (erro.cause.code === 'ETIMEDOUT') {
    return chalk.blue('A requisição demorou demais para responder. Tente novamente mais tarde');
  } else {
    return chalk.magenta('Ocorreu algum erro desconhecido');
  }
}

export default async function listaValidada(listaDeLinks) {
  const links = extraiLinks(listaDeLinks);
  const status = await checaStatus(links);

  return listaDeLinks.map((objeto, indice) => ({
    ...objeto,
    status: status[indice]
  }));
}
