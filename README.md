# chaosnote

This is a simple re-implementation of Jupyter notebook on Javascript(Node.js)

# How to run

```
$ git clone https://github.com/ogochan/chaosnote.git
$ cd chaosnote
$ npm install
```

# status

I tested on Ruby kernel and Javascript(node) kernel. They can run.

* Ruby, node, IPython のkernelについてのみテストしています。他は動くかどうかわかりません。

* IPython kernel が動くため、Pythonコードが動くだけではなく、マジックコマンドも使えるようになりました。

  例えば、以下のコードが実行出来るようになります(iplantumlは自分で入れておいてね)。


```
import iplantuml
```

```
%%plantuml

@startuml
Alice -> Bob: Authentication Request
Bob --> Alice: Authentication Response
@enduml
```

* 認証を組み込み中なので、サーバ起動後はloginをしないと正しく動きません。

  オンラインサイアップが出来るようになっているので、ユーザ登録はそちらで

* ユーザ毎に別々の文書空間が作られます

  サーバを1つ立ち上げるだけで、ワークスペースの干渉なしで複数人でサーバを使うことが出来ます(本家にはない機能！)

  まだノートの共有機能を実装していないので、直接ノートを共有することは出来ません

* 一応ノートを作成してコードを走らせて保存することは出来ますが、細かい機能については追い追い...

# ロードマップ

## Done

* /view/ の実装

* セションをログインユーザ単位で管理する

  シングルサインオン的なことにすると使い良い

* マルチユーザ

  ユーザのワークスペースを分離する

* 認証をマトモにして行く

  認証

  オンラインサインアップ(確認なし)

* サーバを再起動してもlogoutしないようにする

## TODO

* 雑多なコマンドや機能が正しく動くか確認して行く

* 認証をマトモにして行く

  パスワードの変更
  ユーザの削除

* マルチユーザ

  ドキュメントの共有を実装する

* クライアントのJavascriptを整理する

* ipywidgetを動かす

## 将来

* markdown-itを組み込む
