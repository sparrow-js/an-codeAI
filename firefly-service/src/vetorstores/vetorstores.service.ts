import { Chroma } from 'langchain/vectorstores/chroma';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { TextLoader } from 'langchain/document_loaders/fs/text';
import { Injectable } from '@nestjs/common';
import { JSONLoader } from 'langchain/document_loaders/fs/json';
import { Document } from 'langchain/document';
import { demo } from './demo';
import globalConfig from '../globalConfig';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class VetorStoresService {
  vectorStore: Chroma;
  globalConfig = globalConfig.getInstance();
  embeddings: OpenAIEmbeddings;
  constructor() {
    console.log('********812345');
    // this.createDocsEmbedding();
  }

  generateDocuments() {
    return demo.map((item) => {
      return new Document(item as any);
    });
  }

  getOpenAIEmbeddings() {
    if (!this.embeddings) {
      this.embeddings = new OpenAIEmbeddings(
        {
          verbose: true,
          openAIApiKey: this.globalConfig.apikey,
        },
        {
          basePath: 'https://api.closeai-proxy.xyz/v1',
        },
      );
    }
    return this.embeddings;
  }

  async createDocsEmbedding() {
    const docs = this.generateDocuments();
    console.log(docs);
    this.vectorStore = await Chroma.fromDocuments(
      docs,
      this.getOpenAIEmbeddings(),
      {
        collectionName: 'antd-test10011-collection',
      },
    );
  }

  async connectVectorStore(collectionName: string) {
    this.vectorStore = await Chroma.fromExistingCollection(
      this.getOpenAIEmbeddings(),
      { collectionName },
    );
  }

  async getSimilaritySearch(text: string) {
    console.log('*', text);
    const response = await this.vectorStore.similaritySearch(text, 1);
    console.log(response);
    return response;
  }

  async addDocument(data: any) {
    console.log('****567', data);
    const {
      pageContent,
      metadata: { answer, flow },
      child,
    } = data;
    const id = uuidv4();
    const document = new Document({
      pageContent,
      metadata: {
        question: pageContent,
        answer,
        flow,
        id,
      },
    });
    const documents = [document];
    if (child) {
      child.forEach((doc) => {
        const { pageContent, metadata } = doc;
        pageContent &&
          documents.push(
            new Document({
              pageContent,
              metadata: {
                ...metadata,
                id: uuidv4(),
                parentId: id,
              },
            }),
          );
      });
    }
    console.log('******111', documents);
    const res = await this.vectorStore.addDocuments(documents);
    return res;
  }

  async getSimilaritySearchById(text: string, id: string) {
    const response = await this.vectorStore.similaritySearch(text, 1, {
      id,
    });
    console.log(response);
    return response;
  }

  async getSimilaritySearchByFilter(text: string, filter: object) {
    const response = await this.vectorStore.similaritySearch(text, 1, filter);
    console.log(response);
    return response;
  }
}
