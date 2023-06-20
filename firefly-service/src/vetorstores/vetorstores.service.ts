import { Chroma } from 'langchain/vectorstores/chroma';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { TextLoader } from 'langchain/document_loaders/fs/text';
import { Injectable } from '@nestjs/common';
import { JSONLoader } from 'langchain/document_loaders/fs/json';
import { Document } from 'langchain/document';
import { demo } from './demo';
import globalConfig from '../globalConfig';

@Injectable()
export class VetorStoresService {
  vectorStore: Chroma;
  globalConfig = globalConfig.getInstance();
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
    return new OpenAIEmbeddings(
      {
        verbose: true,
        openAIApiKey: this.globalConfig.appkey,
      },
      {
        basePath: 'https://chtgptproxyapi-wht.pages.dev/api/v1',
      },
    );
  }

  async createDocsEmbedding() {
    console.log('111*******');
    const docs = this.generateDocuments();
    console.log(docs);
    this.vectorStore = await Chroma.fromDocuments(
      docs,
      this.getOpenAIEmbeddings(),
      {
        collectionName: 'antd-test9-collection',
      },
    );

    this.getSimilaritySearch('创建购物详情，包括购物名称，购物详情');
    console.log('123*******');
  }

  async connectVectorStore(collectionName: string) {
    this.vectorStore = await Chroma.fromExistingCollection(
      this.getOpenAIEmbeddings(),
      { collectionName },
    );
  }

  async getSimilaritySearch(text: string) {
    const response = await this.vectorStore.similaritySearch(text, 1);
    console.log(response);
    return response;
  }
}
