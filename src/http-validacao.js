import chalk from "chalk";

// Objeto cache para armazenar os status das URLs
const cache = {};

function extraiLinks(arrLinks) {
  return arrLinks.map((objetoLink) => Object.values(objetoLink).join());
}

async function checaStatus(listaURLs) {
  const arrStatus = await Promise.all(
    listaURLs.map(async (url) => {
      // Verifica se a URL já está no cache
      if (cache[url]) {
        // Se a URL já estiver no cache, retorna o status armazenado
        return cache[url];
      }

      try {
        const response = await fetch(url);
        const status = response.status;
        
        // Armazena o status da URL no cache
        cache[url] = status;
        return status;
      } catch (erro) {
        // Se ocorrer um erro, armazena a mensagem de erro no cache
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
  } else if (erro.cause.code === 'MODULE_NOT_FOUND') {
    return chalk.green('Módulo não encontrado. Verifique se todas as dependências estão instaladas');
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
