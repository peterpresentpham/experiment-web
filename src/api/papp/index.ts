import Auth from './auth';
import Conversation from './conversation';
import Message from './message';
import User from './user';

export default class PAppClient {
  static auth = Auth;
  static user = User;
  static conversation = Conversation;
  static message = Message;
}
