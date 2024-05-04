from flask import Flask, request, jsonify
from flask_cors import CORS

import pandas as pd
import nltk
from nltk.corpus import wordnet
from nltk.stem import WordNetLemmatizer
from tag_descriptions import tag_descriptions
freq_bands_frame = pd.read_csv("lemma.num.csv")


def get_wordnet_pos(word, tag):
    if tag.startswith('J'):
        return wordnet.ADJ
    elif tag.startswith('V'):
        return wordnet.VERB
    elif any(tag.startswith(x) for x in ['N', 'P', 'T', 'D', 'I', 'M', 'C', 'U', 'W']):  # Include pronoun tags and others
        return wordnet.NOUN
    elif tag.startswith('R'):
        return wordnet.ADV
    else:
        return None

def categorize_lemmas(lemmas):
    df = pd.DataFrame(lemmas, columns=['lemma', 'pos'])
    print(df)
    result = pd.merge(df, freq_bands_frame, how="left", on='lemma')

    bands = {
        '1k_families': {},
        '2k_families': {},
        '3k+_families': {}
    }
    
    for index, row in result.iterrows():
        band = row['band']
        lemma = row['lemma']
        pos = row['pos']

        if band == 1000:
            bands['1k_families'][lemma] = pos
        elif band == 2000:
            bands['2k_families'][lemma] = pos
        else:
            bands['3k+_families'][lemma] = pos

    return bands

app = Flask(__name__)
CORS(app)

@app.route('/lemmatize_text', methods=['POST'])
def lemmatize_text():
    data = request.get_json()
    text = data['text']
    text = text.lower()
    tokens = nltk.word_tokenize(text)
    tagged = nltk.pos_tag(tokens)
    print(tokens)

    lemmatizer = WordNetLemmatizer()
    lemmas = [(lemmatizer.lemmatize(word, get_wordnet_pos(word, tag)), tag)
              for word, tag in tagged if get_wordnet_pos(word, tag)]

    categorized = categorize_lemmas(lemmas)
    return jsonify(categorized)

if __name__ == '__main__':
    app.run(debug=True)