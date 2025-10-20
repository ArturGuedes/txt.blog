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
  const regex = new RegExp(`\\[${tagName}\\]([\\s\\S]*?)^\\[\\/${tagName}\\]$`, 'm')
  const match = content.match(regex)
  return match ? match[1].trim() : ''
}

function parsePost(postContent) {
  const post = {
    title: extractSimpleTag(postContent, 't'),
    date: extractSimpleTag(postContent, 'd'),
    author: extractSimpleTag(postContent, 'a'),
    link: extractSimpleTag(postContent, 'link'),
    thumb: extractSimpleTag(postContent, 'thumb'),
    content: extractContentTag(postContent, 'txt')
  }
  return post
}

function renderPost(post) {
  return `
    <article id="${post.title}" []-index="${post.index}">
    ${post.thumb ? `<img []-thumb src="${post.thumb}" alt="${post.title}">` : ''}
    <div []-post>
    ${post.title ? `<h1><a href="?id=${post.index}">${post.title}</a></h1>` : ''}
      <div []-meta>
      ${post.date ? `<span []-date>${post.date}</span>` : ''}
      ${post.author ? `- <a []-author href="?author=${encodeURIComponent(post.author)}">${post.author}</a>` : ''}
      </div>
      ${post.content ? `<div []-content>${post.content}</div>` : ''}
      </div>
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

    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search)
    const filterId = urlParams.get('id')
    const filterAuthor = urlParams.get('author')

    const postsText = content.split(/\n--\n/).map(postContent => postContent.trim()).filter(p => p)

    let posts = postsText.map((postContent, index) => ({ ...parsePost(postContent), index }))

    // Filter by id if parameter exists
    if (filterId !== null) {
      const id = parseInt(filterId, 10)
      posts = posts.filter(post => post.index === id)
      if (debug) console.log(`Filtering by id=${id}`, posts)
    }

    // Filter by author if parameter exists
    if (filterAuthor !== null) {
      posts = posts.filter(post => post.author && post.author.toLowerCase().includes(filterAuthor.toLowerCase()))
      if (debug) console.log(`Filtering by author=${filterAuthor}`, posts)
    }

    const postsHTML = posts.map(postContent => renderPost(postContent)).filter(html => html)

    if (debug) console.log('Posts HTML:', postsHTML)
    if (blogContainer) {
      blogContainer.innerHTML = postsHTML.join('')

      // Add class based on number of posts
      if (posts.length > 1) {
        blogContainer.classList.add('multiple-posts')
        blogContainer.classList.remove('single-post')
      } else {
        blogContainer.classList.add('single-post')
        blogContainer.classList.remove('multiple-posts')
      }
    }

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
