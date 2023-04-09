document.ready(function() {
  const componentPosts = new Vue({
    el: '#posts',
    data: {
      template: {
        like: htmlSpecialChars($('#post-aside-template').getAttribute('data-like'), false),
        comment: htmlSpecialChars($('#post-aside-template').getAttribute('data-comment'), false),
        commentReply: htmlSpecialChars($('#post-aside-template').getAttribute('data-commentreply'), false),
        commentStatus: htmlSpecialChars($('#post-aside-template').getAttribute('data-commentstatus'), false),
        commentDelete: htmlSpecialChars($('#post-aside-template').getAttribute('data-commentdelete'), false),
        commentLink: htmlSpecialChars($('#post-aside-template').getAttribute('data-commentlink'), false),
        commentContainer: htmlSpecialChars($('#post-aside-template').getAttribute('data-commentcontainer'), false)
      },
      postsParam: {
        api: {
          like: $('#posts').getAttribute('data-likeapi'),
          comment: $('#posts').getAttribute('data-commentapi'),
          delete: $('#posts').getAttribute('data-deleteapi'),
          commentDelete: $('#posts').getAttribute('data-commentdeleteapi')
        },
        ajaxLock: {
          like: false,
          comment: false,
          delete: false,
          commentDelete: false
        },
        currentFunBoxPost: undefined
      },
      commentformData: {
        elements: {
          targetCommentArea: undefined
        },
        api: {
          guestAvatar: $('#comment-form').getAttribute('data-guestavatarapi')
        },
        ajaxLock: {
          guestAvatar: false
        },
        formFocusholderBool: false,
        formSubmittingBool: false,
        text: '',
        textPlaceholder: $('#comment-form').getAttribute('data-commenttip'),
        textCommentTip: $('#comment-form').getAttribute('data-commenttip'),
        textReplyTip: $('#comment-form').getAttribute('data-replytip'),
        textFocusTimer: undefined,
        stickerShowBool: false,
        metaSummaryBool: $('#comment-form').hasAttribute('data-metasummary') ? true : false,
        avatar: $('#comment-form').getAttribute('data-defaultavatar'),
        avatarError: $('#comment-form').getAttribute('data-noavatar'),
        name: $('#comment-form').getAttribute('data-defaultname'),
        nameErrorBool: false,
        email: $('#comment-form').getAttribute('data-defaultemail'),
        emailErrorBool: false,
        code: $('#comment-form').getAttribute('data-defaultcode'),
        codeErrorBool: false,
        url: $('#comment-form').getAttribute('data-defaulturl'),
        urlErrorBool: false,
        post: 0,
        parentComment: 0,
        toComment: 0,
        hash2: null
      },
      stickerMoreBool: false
    },
    watch: {
      'commentformData.text': function(val) {
        this.commentformData.formFocusholderBool = val != '' ? true : false;
      }
    },
    methods: {
      postidProcessing: function(index) {
        let sepPos = index.indexOf('-');
        return index.slice(0, sepPos);
      },
      postDelete: function(index, button) {
        if (!this.postsParam.ajaxLock.delete) {
          this.postsParam.ajaxLock.delete = true;
          button.classList.add('wait');
          axios.get(this.postsParam.api.delete.tplRender({
            id: this.postidProcessing(index)
          })).then(res => {
            if (res.data[0] == 'delete') {
              let post = $('#post-' + index);
              post.parentNode.removeChild(post);
            } else if (res.data[0] == 'error') {
              button.classList.remove('wait');
            }
            this.postsParam.ajaxLock.delete = false;
          });
        }
      },
      postFun: function(index) {
        let post = $('#post-' + index);
        let classname = 'funboxshow';
        if (post.classList.contains(classname)) {
          this.postsParam.currentFunBoxPost = undefined;
          post.classList.remove(classname);
        } else {
          let parent = post.parentNode;
          for (let child of parent.children) {
            if (child.tagName.toLowerCase() == 'article') child.classList.remove(classname);
          }
          post.classList.add(classname);
          this.postsParam.currentFunBoxPost = post;
        }
      },
      postFunIndirectClose: function(post = this.postsParam.currentFunBoxPost) {
        let classname = 'funboxshow';
        if (post && post.classList.contains(classname)) post.classList.remove(classname);
      },
      postLike: function(index, button) {
        if (!this.postsParam.ajaxLock.like) {
          this.postsParam.ajaxLock.like = true;
          button.classList.add('wait');
          let postlikeArea = $('#post-' + index + '-like');
          let postlikeSibling = $('#post-' + index + '-comment');
          let postlikeList = postlikeArea.firstElementChild;
          let postAside = postlikeArea.parentNode;
          axios.get(this.postsParam.api.like.tplRender({
            id: this.postidProcessing(index)
          })).then(res => {
            if (res.data[0] == 'add' && !$('#post-' + index + '-like-me')) {
              postlikeList.insertAdjacentHTML('beforeend', this.template.like.tplRender({
                me_id: ' id="post-' + index + '-like-me"',
                me_class: ' me',
                name: res.data[1]['name'],
                avatar: res.data[1]['avatar']
              }));
              if (!postlikeArea.classList.contains('show')) postlikeArea.classList.add('show');
              if (!postAside.classList.contains('show')) postAside.classList.add('show');
              button.classList.add('liked');
              button.innerHTML = button.getAttribute('data-likedtext');
            } else if (res.data[0] == 'delete' && $('#post-' + index + '-like-me')) {
              if (postlikeList.childElementCount == 1) {
                if (!postlikeSibling.classList.contains('show')) postAside.classList.remove('show');
                postlikeArea.classList.remove('show');
              }
              postlikeList.removeChild($('#post-' + index + '-like-me'));
              button.classList.remove('liked');
              button.innerHTML = button.getAttribute('data-liketext');
            }
            this.postsParam.ajaxLock.like = false;
            button.classList.remove('wait');
          });
        }
      },
      postComment: function(index, button) {
        if (!this.commentformData.formSubmittingBool && button.classList.contains('allow')) {
          let post = $('#post-' + index);
          let postcommentList = $('#post-' + index + '-comment-list');
          let classname = 'commentform';
          if (this.$refs.commentform.parentNode.getAttribute('data-hash1') == postcommentList.getAttribute('data-hash1')) {
            post.classList.remove(classname);
            this.$refs.hiddenbox.append(this.$refs.commentform);
          } else {
            for (let child of this.$el.children) {
              if (child.tagName.toLowerCase() == 'article') child.classList.remove(classname);
            }
            post.classList.add(classname);
            /* initialization start */
            if (this.commentformData.stickerShowBool) this.commentformData.stickerShowBool = false;
            if (this.stickerMoreBool) this.stickerMoreBool = false;
            this.commentformData.text = '';
            this.commentformData.textPlaceholder = this.commentformData.textCommentTip;
            this.commentformData.post = Number(this.postidProcessing(index));
            this.commentformData.parentComment = 0;
            this.commentformData.toComment = 0;
            this.commentformData.elements.targetCommentArea = $('#post-' + index + '-comment');
            /* initialization end */
            postcommentList.prepend(this.$refs.commentform);
            this.commentformTextareaFocus();
          }
        }
      },
      postCommentReply: function(index, comment) {
        if (!this.commentformData.formSubmittingBool && comment.classList.contains('allow')) {
          let mark1 = comment.getAttribute('data-mark1');
          let mark1List = $('#comment-mark1-' + mark1);
          if ((this.$refs.commentform.parentNode.getAttribute('data-hash1') == mark1List.getAttribute('data-hash1')) && (this.commentformData.hash2 == comment.getAttribute('data-hash2'))) {
            this.$refs.hiddenbox.append(this.$refs.commentform);
          } else {
            let classname = 'commentform';
            for (let child of this.$el.children) {
              if (child.tagName.toLowerCase() == 'article') child.classList.remove(classname);
            }
            /* initialization start */
            if (this.commentformData.stickerShowBool) this.commentformData.stickerShowBool = false;
            if (this.stickerMoreBool) this.stickerMoreBool = false;
            this.commentformData.text = '';
            this.commentformData.textPlaceholder = this.commentformData.textReplyTip.tplRender({
              author: comment.getAttribute('data-author')
            });
            this.commentformData.post = Number(comment.getAttribute('data-post'));
            this.commentformData.parentComment = Number(mark1);
            this.commentformData.toComment = Number(index);
            this.commentformData.elements.targetCommentArea = null;
            /* initialization end */
            mark1List.append(this.$refs.commentform);
            this.commentformTextareaFocus();
          }
          this.commentformData.hash2 = comment.getAttribute('data-hash2');
        }
      },
      postCommentDelete: function(index, button) {
        if (!this.postsParam.ajaxLock.commentDelete && !button.classList.contains('error')) {
          this.postsParam.ajaxLock.commentDelete = true;
          button.classList.add('wait');
          axios.get(this.postsParam.api.commentDelete.tplRender({
            id: index
          })).then(res => {
            if (res.data[0] == 'delete') {
              for (let id of res.data[1]) {
                let comment = $('#comment-' + id);
                if (comment && !comment.classList.contains('deleted')) comment.classList.add('deleted');
              }
            } else if (res.data[0] == 'error') {
              button.classList.add('error');
              setTimeout(() => {
                button.classList.remove('error');
              }, 1000);
            }
            button.classList.remove('wait');
            this.postsParam.ajaxLock.commentDelete = false;
          });
        }
      },
      postActionProcessing: function(dom) {
        if (dom.hasAttribute('data-action')) {
          let action = dom.getAttribute('data-action');
          let index = dom.getAttribute('data-index');
          switch (action) {
            case 'edit':
              window.open(index);
              break;
            case 'delete':
              this.postDelete(index, dom);
              break;
            case 'fun':
              this.postFun(index);
              break;
            case 'like':
              this.postLike(index, dom);
              break;
            case 'comment':
              this.postComment(index, dom);
              break;
            case 'commentreply':
              this.postCommentReply(index, dom);
              break;
            case 'commentdelete':
              this.postCommentDelete(index, dom);
              break;
            case 'viewimage':
              viewImage(index, dom);
              break;
            case 'audioplay':
              window.componentPlayer_postAudioButton(index, dom.getAttribute('data-attachment1'), dom.getAttribute('data-attachment2'));
              break;
            case 'morecontent':
              moreContent(index, dom);
              break;
            case 'morecomment':
              window.location.href = index;
              break;
          }
        }
      },
      commentformTextareaFocus: function() {
        if (this.commentformData.textFocusTimer) clearTimeout(this.commentformData.textFocusTimer);
        this.commentformData.textFocusTimer = setTimeout(() => {
          this.$refs.commentformTextarea.focus();
        }, 250);
      },
      commentformGuestAvatarNowGet: function() {
        if (!this.commentformData.ajaxLock.guestAvatar) {
          this.commentformData.ajaxLock.guestAvatar = true;
          axios.get(this.commentformData.api.guestAvatar, {
            params: {
              email: this.commentformData.email
            }
          }).then(res => {
            if (res.data[0] == 'avatar') {
              this.commentformData.avatar = res.data[1];
            } else if (res.data[0] == 'error') {
              this.commentformData.avatar = this.commentformData.avatarError;
            }
            this.commentformData.ajaxLock.guestAvatar = false;
          });
        }
      },
      commentformSubmitButton: function() {
        if (!this.postsParam.ajaxLock.comment) {
          this.postsParam.ajaxLock.comment = true;
          this.commentformData.formSubmittingBool = true;
          let data = new FormData();
          data.append('author', this.commentformData.name);
          data.append('email', this.commentformData.email);
          data.append('code', this.commentformData.code);
          data.append('url', this.commentformData.url);
          data.append('comment', this.commentformData.text);
          data.append('comment_post_ID', this.commentformData.post);
          data.append('comment_parent', this.commentformData.parentComment);
          data.append('comment_to', this.commentformData.toComment);
          axios.post(this.postsParam.api.comment, data, {
            headers: {
              'Content-Type': 'application/x-www-urlencoded'
            }
          }).then(res => {
            if (res.data[0] == 'add') {
              let comment = res.data[1];
              let commentRender = this.template.comment.tplRender({
                id: comment['id'],
                postid: comment['post_id'],
                avatar: comment['avatar'],
                from: comment['name'],
                from_link: (comment['url'] != '' ? this.template.commentLink.tplRender({
                  name: comment['name'],
                  url: comment['url']
                }) : comment['name']),
                status_tpl: (comment['approved'] != '' ? this.template.commentStatus.tplRender({
                  status: comment['approved']
                }) : ''),
                delete_tpl: (comment['delete_allow'] == 'open' ? this.template.commentDelete.tplRender({
                  id: comment['id']
                }) : ''),
                date: comment['date'],
                reply_tpl: (comment['parent_id'] == 0 ? '' : this.template.commentReply.tplRender({
                  to: comment['to_name'],
                  to_status_tpl: (comment['to_approved'] != '' ? this.template.commentStatus.tplRender({
                    status: comment['to_approved']
                  }) : '')
                })),
                reply_allow_class: comment['reply_allow_class'],
                sep_ignore_class: (comment['parent_id'] == 0 ? ' sep-ignore' : ''),
                text: comment['content'],
                mark1: comment['mark1'],
                hash2: comment['hash2']
              });
              /*if (comment['parent_id'] == 0) commentRender = this.template.commentContainer.tplRender({
                mark1: comment['mark1'],
                hash1: comment['hash1'],
                item_html: commentRender
              });
              this.$refs.commentform.insertAdjacentHTML((comment['parent_id'] == 0 ? 'afterend' : 'beforebegin'), commentRender);*/
              commentRender = this.template.commentContainer.tplRender({
                mark1: comment['mark1'],
                hash1: comment['hash1'],
                item_html: commentRender
              });
              var node=this.$refs.commentform;
              while(node&&node.tagName.toLowerCase()!='ul')node=node.parentNode;
              node.insertAdjacentHTML('beforeend',commentRender);
              while(node&&node.tagName.toLowerCase()!='article')node=node.parentNode;
              node.classList.remove('commentform');
              this.$refs.hiddenbox.append(this.$refs.commentform);
              setTimeout(function(){window.location.hash="#comment-"+comment['id']},100);
              /* initialization start */
              if (this.commentformData.stickerShowBool) this.commentformData.stickerShowBool = false;
              if (this.stickerMoreBool) this.stickerMoreBool = false;
              if (!this.commentformData.metaSummaryBool) this.commentformData.metaSummaryBool = true;
              this.commentformData.avatar = comment['avatar'];
              this.commentformData.text = '';
              /* initialization end */
              if (this.commentformData.elements.targetCommentArea) {
                let postcommentArea = this.commentformData.elements.targetCommentArea;
                let postAside = postcommentArea.parentNode;
                if (!postcommentArea.classList.contains('show')) postcommentArea.classList.add('show');
                if (!postAside.classList.contains('show')) postAside.classList.add('show');
              }
            } else if (res.data[0] == 'error') {
              let error = res.data[1];
              switch (error) {
                case 'name':
                  this.commentformData.nameErrorBool = true;
                  break;
                case 'email':
                  this.commentformData.emailErrorBool = true;
                  break;
                case 'code':
                  this.commentformData.codeErrorBool = true;
                  break;
                case 'url':
                  this.commentformData.urlErrorBool = true;
                  break;
                default:
                  log('commentform error: ' + error);
              }
              if (['name', 'email', 'code', 'url'].includes(error) && this.commentformData.metaSummaryBool) this.commentformData.metaSummaryBool = false;
            }
            this.postsParam.ajaxLock.comment = false;
            this.commentformData.formSubmittingBool = false;
          });
        }
      },
      stickerInputButton: function(dom) {
        if (!this.commentformData.formSubmittingBool && dom.hasAttribute('data-shortcode')) {
          let shortcode = dom.getAttribute('data-shortcode');
          textareaInsert(this.$refs.commentformTextarea, shortcode);
          this.commentformData.text = this.$refs.commentformTextarea.value;
        }
      },
      __commentform_submit: function() {
        this.$refs.commentformSubmit.click();
      }
    },
    mounted: function() {
      window.componentPosts_postFunIndirectClose = this.postFunIndirectClose;
    }
  });
});
