async function fetchFile(url) {
  try {
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.text()
  } catch (error) {
    console.error('Erro ao carregar arquivo:', error)
    throw error
  }
}

function extractSimpleTag(content, tagName) {
  const regex = new RegExp(`^\\[${tagName}\\]\\s*(.+?)$`, 'm')
  const match = content.match(regex)
  return match ? match[1].trim() : ''
}

function extractContentTag(content, tagName) {
  const regex = new RegExp(`^\\[${tagName}\\]([\\s\\S]*?)^\\[\\/${tagName}\\]`, 'm')
  const match = content.match(regex)
  return match ? match[1].trim() : ''
}

function parsePost(postContent) {
  const post = {
    title: extractSimpleTag(postContent, 't'),
    date: extractSimpleTag(postContent, 'd'),
    author: extractSimpleTag(postContent, 'a'),
    link: extractSimpleTag(postContent, 'link'),
    image: extractSimpleTag(postContent, 'img'),
    content: extractContentTag(postContent, 'p')
  }
  return post
}

function renderPost(post) {
  return `
    <article class='txt-feed' data-index="${post.index}">
      ${post.title ? `<h1>${post.title}</h1>` : ''}
      ${post.content ? `<p>${post.content}</p>` : ''}
      ${post.author ? `<p>${post.author}</p>` : ''}
      ${post.date ? `<h4>${post.date}</h4>` : ''}
      ${post.link ? `<a href="${post.link}" target="_blank">${post.link}</a>` : ''}
      ${post.image ? `<img src="${post.image}" alt="${post.title}">` : ''}
    </article>
  `
}

async function initBlog(
  postsPath,
  {
    containerId = 'blog-root',
    debug = false
  }) {
  try {
    const content = await fetchFile(postsPath)
    if (debug) console.log('[txt]blog: File content loaded successfully')
    const blogContainer = document.getElementById(containerId)


    const postsText = content.split(/\n--\n/).map(postContent => postContent.trim()).filter(p => p)

    const posts = postsText.map((postContent, index) => ({ ...parsePost(postContent), index }))
    const postsHTML = posts.map(postContent => renderPost(postContent)).filter(html => html)

    if (blogContainer) blogContainer.innerHTML = postsHTML.join('')

    if (debug) console.log('[txt]blog:', { postsPath, containerId, hasContainer: !!blogContainer, posts })
    return posts
  } catch (error) {
    console.error('Falha ao inicializar blog:', error)

    const blogContainer = document.getElementById(config.containerId)
    if (blogContainer) {
      blogContainer.innerHTML = `
        <div class='feed'>
          <h1>Erro</h1>
          <p>Não foi possível carregar as postagens.</p>
          <p><small>Detalhes: ${error.message}</small></p>
        </div>
      `
    }
  }
}
