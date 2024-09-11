class becomeDealer extends HTMLElement{
    constructor(){
        super();
        this.init();
    }

    init(){
        this.form = this.querySelector('form');
        this.form.addEventListener("submit", this._handleSubmit.bind(this));
        this.responseMessageContainer = this.querySelector('#responseMessage');
    }

    async _handleSubmit(event){
        event.preventDefault();
        const formData = new FormData(this.form);
        let interestedProducts = [];
        formData.forEach((value, key) => {
          if(key==='interested_products'){
            interestedProducts.push(value);
          }
        });
        formData.delete('interested_products');
        formData.append('interested_products', interestedProducts.join(','))
        formData.delete('terms_conditions');
        formData.append('terms_conditions', true);
        const data = Object.fromEntries(formData.entries());
        console.log(data);
        
        const response =  await fetch('/apps/greenworks/become-dealer', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            },
            redirect: 'manual',
            body: JSON.stringify(data),
          }).then(response => {
            if (response.ok) {
              this.responseMessageContainer.innerHTML = '<p>Thanks for contacting us! We will get back to you soon.</p>'
              return response.json();
            } else {
              throw new Error('Network response was not ok');
            }
          }).catch(error => {
            console.error(error);
          });
      
          console.log(response , 'response from the app proxy');
             
          setTimeout(() => {
            this.responseMessageContainer.innerHTML = '';
            this.form.reset();
          }, 3000); // 3 seconds
    }
}

customElements.define('become-dealer', becomeDealer);