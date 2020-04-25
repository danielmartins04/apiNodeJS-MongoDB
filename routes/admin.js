const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
require("../models/Categoria");
const Categoria = mongoose.model("categorias");
require("../models/Postagem");
const Postagem = mongoose.model("postagens");
const {admin} = require('../helpers/admin');

router.get('/', admin, (req, res) => {
    res.render("admin/index");
});

router.get('/posts', admin, (req, res) => {
    res.send("Pagina de posts.");
});

router.get('/categorias', admin, (req, res) => {
    Categoria.find().then((categorias) => {
        res.render('admin/categorias', { categorias: categorias.map(categoria => categoria.toJSON()) });
        //res.render('/admin/categorias', {categorias: categorias.map(categoria => categoria.toJSON())})    
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao listar as categorias");
        res.redirect("/admin");
    })
});

router.post('/categorias/nova', admin, (req, res) => {

    var erros = [];

    if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
        erros.push({ texto: "Nome invalido" });
    }

    if (!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null) {
        erros.push({ texto: "Slug invalido" });
    }

    if (req.body.nome.length < 2) {
        erros.push({ texto: "Nome da categoria muito pequeno" });
    }

    if (erros.length > 0) {
        res.render("admin/addcategorias", { erros: erros });
    } else {
        const novaCategoria = {
            nome: req.body.nome,
            slug: req.body.slug
        }

        new Categoria(novaCategoria).save().then(() => {
            req.flash("success_msg", "Categoria criada com sucesso");
            res.redirect("/admin/categorias");
        }).catch((err) => {
            req.flash("error_msg", "erro ao salvar a categoria");
            //console.log("Deu barro" + err);
        });
    }
});

router.get('/categorias/add', admin, (req, res) => {
    res.render("admin/addcategorias");
});

router.get('/categorias/edit/:id', admin, (req, res) => {
    Categoria.findOne({ _id: req.params.id }).then((categoria) => {
        res.render('admin/editcategorias', { categoria: categoria });
    }).catch((err) => {
        req.flash("error_msg", "Categoria inexistente");
        res.redirect('/admin/categorias');
    });
});

router.post('/categorias/edit', admin, (req, res) => {

    var erros = [];

    if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
        erros.push({ texto: "Nome invalido" });
    }

    if (!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null) {
        erros.push({ texto: "Slug invalido" });
    }

    if (req.body.nome.length < 2) {
        erros.push({ texto: "Nome da categoria muito pequeno" });
    }

    if (erros.length > 0) {
        res.render("admin/editcategorias", { erros: erros });
    } else {
        Categoria.findOne({ _id: req.body.id }).then((categoria) => {

            categoria.nome = req.body.nome;
            categoria.slug = req.body.slug;

            categoria.save().then(() => {
                req.flash("success_msg", "Categoria editada com sucesso");
                res.redirect('/admin/categorias');
            }).catch((err) => {
                req.flash("error_msg", "Erro ao editar");
                req.redirect('/admin/categorias');
            });

        }).catch((err) => {
            req.flash("error_msg", "Erro ao editar categoria." + err);
            res.redirect('/admin/categorias');
        })
    }
});

router.post('/categorias/deletar', admin, (req, res) => {
    Categoria.deleteOne({_id: req.body.id}).then(() => {
        req.flash("success_msg", "Categoria deletada com sucesso.");
        res.redirect('/admin/categorias');
    }).catch((err) => {
        req.flash("error_msg", "Erro ao deletar categoria");
        res.redirect('/admin/categorias');
    });
});

router.get('/postagens', admin, (req, res) => {

    Postagem.find().populate("categoria").sort({data: "desc"}).then((postagens) => {
        res.render('admin/postagens', {postagens: postagens});
    }).catch((err) => {
        req.flash("error_msg", "Erro ao listar postagens");
        res.redirect('/admin');
    });
});

router.get('/postagens/add', admin, (req, res) => {
    Categoria.find().then((categorias) => {
        res.render('admin/addpostagem', {categorias : categorias});
    }).catch((err) => {
        req.flash("error_msg", "Erro ao carregar postagens");
        res.redirect('/admin');
    });
});

router.post('/postagens/nova', admin, (req, res) => {
    var erros = [];

    if (req.body.categoria == "0") {
        erros.push({texto: "Registre uma categoria."});
    } 

    if (erros.length > 0) {
        res.render('admin/addpostagem', {erros : erros});
    } else {
        const novaPostagem = {
            titulo: req.body.titulo,
            descricao: req.body.descricao,
            conteudo: req.body.conteudo,
            categoria: req.body.categoria,
            slug: req.body.slug
        }

        new Postagem(novaPostagem).save().then(() => {
            req.flash("success_msg", "Postagem criada com sucesso");
            res.redirect('/admin/postagens');
        }).catch((err) => {
            req.flash("error_msg", "Erro ao criar postagem.");
            res.redirect('/admin/postagens');
        });
    }
});

router.get('/postagens/edit/:id', admin, (req, res) => {

    Postagem.findOne({_id: req.params.id}).then((postagem) => {
        Categoria.find().then((categorias) => {
            res.render('admin/editpostagens', {categorias: categorias, postagem: postagem});
        }).catch((err) => {
            req.flash("error_msg", "Erro ao listar categorias");
            res.redirect('/admin/postagens');
        })
    }).catch((err) => { 
        req.flash("error_msg", "Erro ao carregar formulario de edição");
        res.redirect('/admin/postagens');
    });
});

router.post('/postagem/edit', admin, (req, res) => {

    Postagem.findOne({_id: req.body.id}).then((postagem) => {

        postagem.titulo = req.body.titulo;
        postagem.slug = req.body.slug;
        postagem.descricao = req.body.descricao;
        postagem.conteudo = req.body.conteudo;
        postagem.categoria = req.body.categoria;

        postagem.save().then(() => {
            req.flash("success_msg", "Postagem editada com sucesso");
            res.redirect('/admin/postagens');
        }).catch((err) => {
            req.flash("error_msg", "Erro interno");
            res.redirect('/admin/postagens');
        });

    }).catch((err) => {
        req.flash("error_msg", "Erro ao salvar edição");
        res.redirect('/admin/postagens');
    });
});

router.get('/postagens/deletar/:id', admin, (req, res) => {
    Postagem.deleteOne({_id: req.params.id}).then(() => {
        req.flash("success_msg", "Postagem deletada com sucesso");
        res.redirect('/admin/postagens');
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro");
        res.redirect('/admin/postagens');
    });
});

module.exports = router;