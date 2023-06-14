import { Chroma } from 'langchain/vectorstores/chroma';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { TextLoader } from 'langchain/document_loaders/fs/text';
import { Injectable } from '@nestjs/common';

@Injectable()
export class VetorStoresService {
  name = '';
}
