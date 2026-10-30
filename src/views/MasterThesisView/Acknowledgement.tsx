import { AppArticle } from 'src/components/box/ArticleBox';
import SameChapterBox from 'src/components/Thesis/SameChapterBox';

export default function Acknowledgement() {
  return (
    <SameChapterBox id="acknowledgement" mode="acknowledgement">
      <AppArticle isFirst>
        First, I would like to express my deepest gratitude to my supervisor, Dr. Trần Vĩnh Đức, at
        the School of Information and Technology, Hanoi University of Science and Technology, who
        gave me invaluable guidance and support throughout this thesis.
      </AppArticle>
      <AppArticle>
        Special thanks to my friends and colleagues, who generously shared their knowledge and
        discussions during the development of this project. Your input and support were crucial in
        overcoming challenges and refining key ideas.
      </AppArticle>
      <AppArticle>Thank you all.</AppArticle>
    </SameChapterBox>
  );
}
