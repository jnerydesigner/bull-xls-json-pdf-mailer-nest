import { Process, Processor } from '@nestjs/bull';
import * as nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.ethereal.email',
  port: 587,
  auth: {
    user: 'samanta.dicki@ethereal.email',
    pass: 'Kvqffgte3742AfGYzY',
  },
});

// xls
import * as fs from 'node:fs';
import * as XLSX from 'xlsx';
XLSX.set_fs(fs);

// pdf
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { TDocumentDefinitions } from 'pdfmake/interfaces';

import { writeFileSync } from 'fs';
import { Logger } from '@nestjs/common';

(<any>pdfMake).vfs = pdfFonts.pdfMake.vfs;

@Processor('xls-convert-pdf')
export class AppConsumer {
  private logger: Logger;
  constructor() {
    this.logger = new Logger(AppConsumer.name);
  }
  @Process()
  async getQueue() {
    const workBook = XLSX.readFile('games-compact.xlsx');
    const wsNames = workBook.SheetNames[0];
    const workSheet = workBook.Sheets[wsNames];

    const gamesJS = XLSX.utils.sheet_to_json(workSheet);

    const games: GamesTypes[] = gamesJS.map((game) => {
      return {
        gameName: game['Game Name'],
        system: game['System Full'],
        developer: game['Developer'],
        imageUrl: game['Image_URL'],
        releaseDate: game['Release Date'],
      };
    });

    await this.generatePdf(games);
  }

  async generatePdf(data: GamesTypes[]) {
    const rows = [];

    for (const game of data) {
      game['releaseDate'] =
        game['releaseDate'] === undefined
          ? new Date().toDateString()
          : game['releaseDate'];
      if (
        game['releaseDate'] ||
        game['releaseDate'] !== '' ||
        game['releaseDate'] !== undefined
      ) {
        rows.push([
          game['gameName'],
          game['system'],
          game['developer'],
          game['imageUrl'],
          game['releaseDate'],
        ]);
      }
    }

    const docDefinitions: TDocumentDefinitions = {
      pageOrientation: 'landscape',
      content: [
        {
          text: 'Relatório de Games',
          alignment: 'center',
          style: 'header',
        },
        {
          style: 'tableGame',
          table: {
            widths: [100, 100, 100, '*', 100],
            body: [
              [
                {
                  style: 'title',
                  text: 'Nome',
                },
                {
                  style: 'title',
                  text: 'Sistema',
                },
                {
                  style: 'title',
                  text: 'Desenvolvedor',
                },
                {
                  style: 'title',
                  text: 'Url da Imagem',
                },
                {
                  style: 'title',
                  text: 'Ano de Lançamento',
                },
              ],
              ...rows,
            ],
          },
        },
      ],
      styles: {
        header: {
          fontSize: 22,
          bold: true,
        },
        tableGame: {
          alignment: 'center',
        },
        title: {
          fillColor: '#6c5ce7',
          fontSize: 14,
          color: '#fff',
          bold: true,
        },
      },
    };

    try {
      pdfMake.createPdf(docDefinitions).getBuffer(async (buffer) => {
        writeFileSync('tabela_de_games.pdf', buffer);

        await this.sendMail().then(() => {
          this.logger.log('Processo Terminou');
        });
      });
    } catch (e) {
      console.log(e);
    }
  }

  async sendMail() {
    const nameAttachments = 'Relatório de Games.pdf';
    const html = `
    <h2>Seu Relatório está Pronto</h2>
    <p>Só é fazer o download: ${nameAttachments}</p>
    `;
    await transporter.sendMail({
      from: 'jander.webmaster@gmail.com',
      to: 'jander.fake@fake.com',
      subject: 'Chegou Seu relatório 🌠',
      html: html,
      attachments: [
        {
          filename: nameAttachments,
          content: fs.createReadStream('tabela_de_games.pdf'),
          contentType: 'application/pdf',
        },
      ],
    });
  }
}

export type GamesTypes = {
  gameName: string;
  system: string;
  developer: string;
  imageUrl: string;
  releaseDate: string;
};
