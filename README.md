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

%%plantuml

@startuml
Alice -> Bob: Authentication Request
Bob --> Alice: Authentication Response
@enduml
```

* 一応ノートを作成してコードを走らせて保存することは出来ますが、細かい機能については追い追い...

* 認証を組み込み中なので、サーバ起動後はloginをしないと正しく動きません。

  ただし、実際に認証はしていないので、ユーザ名パスワードは何を入れても通ります

# TODO

* 雑多なコマンドや機能が正しく動くか確認して行く

* /view/ の実装

* 認証をマトモにして行く

* サーバを再起動してもlogoutしないようにする

* クライアントのJavascriptを整理する

# 将来

* ドキュメントの共有を実装する
