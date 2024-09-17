(function() {
  function mauGallery(element, options) {
    options = Object.assign({}, mauGallery.defaults, options);
    let tagsCollection = [];
    
    createRowWrapper(element);
    if (options.lightBox) {
      createLightBox(element, options.lightboxId, options.navigation);
    }

    setupListeners(element, options);

    const galleryItems = element.querySelectorAll(".gallery-item");
    galleryItems.forEach(function(item, index) {
      responsiveImageItem(item);
      moveItemInRowWrapper(item);
      wrapItemInColumn(item, options.columns);
      
      const theTag = item.getAttribute("data-gallery-tag");
      if (options.showTags && theTag && !tagsCollection.includes(theTag)) {
        tagsCollection.push(theTag);
      }
    });

    if (options.showTags) {
      showItemTags(element, options.tagsPosition, tagsCollection);
    }

    element.style.display = 'block';
    element.style.transition = 'opacity 0.5s';
    element.style.opacity = 1;
  }

  mauGallery.defaults = {
    columns: 3,
    lightBox: true,
    lightboxId: null,
    showTags: true,
    tagsPosition: "bottom",
    navigation: true
  };

  function setupListeners(gallery, options) {
    gallery.querySelectorAll(".gallery-item").forEach(item => {
      item.addEventListener("click", function() {
        if (options.lightBox && item.tagName === "IMG") {
          openLightBox(item, options.lightboxId);
        }
      });
    });

    gallery.addEventListener("click", function(event) {
      if (event.target.classList.contains("nav-link")) {
        filterByTag(event.target);
      }
    });

    document.querySelector(".mg-prev")?.addEventListener("click", function() {
      prevImage(options.lightboxId);
    });

    document.querySelector(".mg-next")?.addEventListener("click", function() {
      nextImage(options.lightboxId);
    });
  }

  function createRowWrapper(element) {
    if (!element.querySelector(".row")) {
      const row = document.createElement("div");
      row.classList.add("gallery-items-row", "row");
      element.appendChild(row);
    }
  }

  function wrapItemInColumn(item, columns) {
    const columnDiv = document.createElement("div");
    columnDiv.classList.add("item-column", "mb-4");

    if (typeof columns === 'number') {
      columnDiv.classList.add(`col-${Math.ceil(12 / columns)}`);
    } else if (typeof columns === 'object') {
      if (columns.xs) columnDiv.classList.add(`col-${Math.ceil(12 / columns.xs)}`);
      if (columns.sm) columnDiv.classList.add(`col-sm-${Math.ceil(12 / columns.sm)}`);
      if (columns.md) columnDiv.classList.add(`col-md-${Math.ceil(12 / columns.md)}`);
      if (columns.lg) columnDiv.classList.add(`col-lg-${Math.ceil(12 / columns.lg)}`);
      if (columns.xl) columnDiv.classList.add(`col-xl-${Math.ceil(12 / columns.xl)}`);
    } else {
      console.error(`Columns should be defined as numbers or objects. ${typeof columns} is not supported.`);
    }

    item.parentNode.insertBefore(columnDiv, item);
    columnDiv.appendChild(item);
  }

  function moveItemInRowWrapper(item) {
    const row = document.querySelector(".gallery-items-row");
    row.appendChild(item);
  }

  function responsiveImageItem(item) {
    if (item.tagName === "IMG") {
      item.classList.add("img-fluid");
    }
  }

  function openLightBox(item, lightboxId) {
    const lightbox = document.getElementById(lightboxId);
    if (lightbox) {
      const lightboxImage = lightbox.querySelector(".lightboxImage");
      lightboxImage.src = item.src;
      lightbox.classList.add("show");
    }
  }

  function prevImage() {
    const activeImage = document.querySelector(".lightboxImage").src;
    const imagesCollection = Array.from(document.querySelectorAll("img.gallery-item"));
    let index = imagesCollection.findIndex(img => img.src === activeImage);
    let prevImage = imagesCollection[index - 1] || imagesCollection[imagesCollection.length - 1];
    document.querySelector(".lightboxImage").src = prevImage.src;
  }

  function nextImage() {
    const activeImage = document.querySelector(".lightboxImage").src;
    const imagesCollection = Array.from(document.querySelectorAll("img.gallery-item"));
    let index = imagesCollection.findIndex(img => img.src === activeImage);
    let nextImage = imagesCollection[index + 1] || imagesCollection[0];
    document.querySelector(".lightboxImage").src = nextImage.src;
  }

  function createLightBox(gallery, lightboxId, navigation) {
    const lightboxDiv = document.createElement("div");
    lightboxDiv.classList.add("modal", "fade");
    lightboxDiv.id = lightboxId || "galleryLightbox";
    lightboxDiv.setAttribute("tabindex", "-1");
    lightboxDiv.setAttribute("role", "dialog");
    
    const lightboxContent = `
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-body">
            ${navigation ? '<div class="mg-prev" style="cursor:pointer;position:absolute;top:50%;left:-15px;background:white;"><</div>' : ''}
            <img class="lightboxImage img-fluid" alt="Contenu de l'image affichée dans la modale au clique"/>
            ${navigation ? '<div class="mg-next" style="cursor:pointer;position:absolute;top:50%;right:-15px;background:white;}">></div>' : ''}
          </div>
        </div>
      </div>`;
    
    lightboxDiv.innerHTML = lightboxContent;
    gallery.appendChild(lightboxDiv);
  }

  function showItemTags(gallery, position, tags) {
    let tagItems = '<li class="nav-item"><span class="nav-link active active-tag"  data-images-toggle="all">Tous</span></li>';
    tags.forEach(function(tag) {
      tagItems += `<li class="nav-item"><span class="nav-link" data-images-toggle="${tag}">${tag}</span></li>`;
    });
    
    const tagsRow = document.createElement("ul");
    tagsRow.classList.add("my-4", "tags-bar", "nav", "nav-pills");
    tagsRow.innerHTML = tagItems;

    if (position === "bottom") {
      gallery.appendChild(tagsRow);
    } else if (position === "top") {
      gallery.insertBefore(tagsRow, gallery.firstChild);
    } else {
      console.error(`Unknown tags position: ${position}`);
    }
  }

  function filterByTag(target) {
    if (target.classList.contains("active-tag")) return;

    document.querySelector(".active-tag").classList.remove("active", "active-tag");
    target.classList.add("active", "active-tag");

    const tag = target.getAttribute("data-images-toggle");

    document.querySelectorAll(".gallery-item").forEach(item => {
      const parentColumn = item.closest(".item-column");
      parentColumn.style.display = "none";

      if (tag === "all" || item.getAttribute("data-gallery-tag") === tag) {
        parentColumn.style.display = "block";
        parentColumn.style.transition = "all 0.3s ease";
      }
    });
  }

  window.mauGallery = mauGallery;
})();
