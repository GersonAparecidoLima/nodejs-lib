import chalk from 'chalk';
import fs from 'fs';
import pegaArquivo from './index.js';
import listaValidada from './http-validacao.js';

const caminho = process.argv;

async function imprimeLista(valida, resultado, identificador = '', json = false) {
  const listaFinal = await listaValidada(resultado.links);

  const output = {
    total: resultado.total,
    links: json ? listaFinal : resultado.links,
    validada: json ? (valida ? 'sim' : 'não') : undefined
  };

  if (json) {
    // Exibe a saída como JSON
    console.log(JSON.stringify(output, null, 2));
  } else {
    // Exibe a saída no formato tradicional
    if (valida) {
      console.log(
        chalk.black.bgBlueBright('Total de links : ' + resultado.total + '\n'),
        chalk.yellow('lista validada'),
        chalk.black.bgGreen(identificador),
        listaFinal
      );
    } else {
      console.log(
        chalk.black.bgBlueBright('Total de links : ' + resultado.total + '\n'),
        chalk.yellow('lista de links'),
        chalk.black.bgGreen('Lista de links : ' + identificador),
        resultado.links
      );
    }
  }
}

async function processaTexto(argumentos) {
  const caminho = argumentos[2];
  const valida = argumentos[3] === '--valida';
  const json = argumentos[4] === '--json';  // Verifica se o argumento --json foi passado

  try {
    fs.lstatSync(caminho);
  } catch (erro) {
    if (erro.code === 'ENOENT') {
      console.log('arquivo ou diretório não existe');
      return;
    }
  }

  if (fs.lstatSync(caminho).isFile()) {
    const resultado = await pegaArquivo(argumentos[2]);
    imprimeLista(valida, resultado, '', json);
  } else if (fs.lstatSync(caminho).isDirectory()) {
    const arquivos = await fs.promises.readdir(caminho);
    arquivos.forEach(async (nomeDeArquivo) => {
      const lista = await pegaArquivo(`${caminho}/${nomeDeArquivo}`);
      imprimeLista(valida, lista, nomeDeArquivo, json);
    });
  }
}

processaTexto(caminho);
