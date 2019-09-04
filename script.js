class TableOfContents
{
	constructor( rootElement, options = {} )
	{
		this.rootElement = rootElement;
		this.options = {
			itemsContainerSelector: '.toc-items',
			itemSelector: '.toc-item',
			itemHeaderSelector: '.header',
			boxSelector: '.toc-box',
			boxFloatingClass: 'floating',
			boxItemsContainerSelector: '.toc-items-list',
			itemTemplate: ( title ) => `<a href="#">${title}</a>`,
			itemActiveClass: 'active',

			scrollTopMinValue: 0,
			bottomScrollMargin: 0,
			headerTopMargin: 15,

			scrollAnimationTime: 500,
			disableFloatingOnWidthLessThan: false
		};

		this.__loadOptions( options );

		this._currentScrollValue = 0;
		this._boxElement = this.rootElement.querySelector( this.options.boxSelector );

		this._createItems();
		this._initEvents();
	}


	__loadOptions( options )
	{
		this.options = { ...this.options, ...options };
	}


	_initEvents()
	{
		const htmlElement = document.querySelector( 'html' );

		document.addEventListener( 'scroll', () =>
		{
			this._currentScrollValue = htmlElement.scrollTop - this.rootElement.offsetTop;

			this._updateBox();
		} );
	}


	_createItems()
	{
		const headers = this.__getTocHeaders();
		let itemsTemplate = '<ul>';

		headers.forEach( ( header ) =>
		{
			const headerText = header.innerText;

			itemsTemplate += `<li>${this.options.itemTemplate( headerText )}</li>`;
		} );

		itemsTemplate += '</ul>';

		this._boxElement.querySelector( this.options.boxItemsContainerSelector ).innerHTML = itemsTemplate;

		const items = this._boxElement.querySelectorAll( this.options.boxItemsContainerSelector + ' li' );

		items.forEach( ( item, number ) =>
		{
			item.addEventListener( 'click', ( event ) =>
			{
				event.preventDefault();

				this._scrollToHeader( number );
			} );
		})
	}


	_scrollToHeader( number )
	{
		const header = this.__getTocHeaders()[number];
		const htmlElement = document.querySelector( 'html' ),
			itemsElement = this.rootElement.querySelector( this.options.itemsContainerSelector );

		const currentScrollTop = htmlElement.scrollTop,
			destinationScroll = itemsElement.offsetTop + header.offsetTop - this.options.headerTopMargin,
			step = 10;
		let timeElapsed = 0;

		htmlElement.scrollTop = destinationScroll;

		clearInterval( this.__scrollInterval );

		this.__scrollInterval = setInterval( () =>
		{
			timeElapsed += step;

			const progress = timeElapsed / this.options.scrollAnimationTime;

			htmlElement.scrollTop = currentScrollTop + ( destinationScroll - currentScrollTop ) * progress;

			if ( timeElapsed >= this.options.scrollAnimationTime )
				clearInterval( this.__scrollInterval );
		}, step );
	}


	__getTocHeaders()
	{
		return this.rootElement.querySelectorAll( this.options.itemSelector + ' ' + this.options.itemHeaderSelector );
	}


	_updateBox()
	{
		this._updateFloatingClass();
		this._updateBoxPosition();
		this._updateActiveLink();
	}


	_updateFloatingClass()
	{
		if ( this._shouldBoxFloat() )
			this._boxElement.classList.add( this.options.boxFloatingClass );
		else
			this._boxElement.classList.remove( this.options.boxFloatingClass );
	}


	_updateBoxPosition()
	{
		if ( !this._shouldBoxFloat() )
			return;

		this._boxElement.classList.add( this.options.boxFloatingClass );

		const positionY = Math.min( this._currentScrollValue, this.rootElement.offsetHeight - this._boxElement.offsetHeight - this.options.bottomScrollMargin );

		this._boxElement.style.top = positionY + 'px';
	}


	_shouldBoxFloat()
	{
		return this._currentScrollValue >= this.options.scrollTopMinValue
			&& ( window.innerWidth > this.options.disableFloatingOnWidthLessThan
			|| this.options.disableFloatingOnWidthLessThan === false );
	}


	_updateActiveLink()
	{
		let activeLink = 0;
		const headers = this.__getTocHeaders();

		const boxBounds = this._boxElement.getBoundingClientRect();

		headers.forEach( ( header, number ) =>
		{
			const headerBounds = header.getBoundingClientRect();

			if ( headerBounds.top - this.options.headerTopMargin <= boxBounds.top )
				activeLink = number;
		} );

		const items = this._boxElement.querySelectorAll( this.options.boxItemsContainerSelector + ' ul  li' )

		items.forEach( ( item ) => item.classList.remove( this.options.itemActiveClass ) );

		items[activeLink].classList.add( this.options.itemActiveClass );
	}
}

document.addEventListener( 'DOMContentLoaded', () =>
{
	new TableOfContents( document.querySelector( '.row.toc' ), {
		scrollTopMinValue: -40,
		bottomScrollMargin: 40,
		disableFloatingOnWidthLessThan: 991
	} );
} );